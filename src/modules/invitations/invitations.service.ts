import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from '../../entities/invitation.entity';
import { Organization } from '../../entities/organization.entity';
import { OrganizationMember, OrganizationRole, MemberStatus } from '../../entities/organization-member.entity';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepo: Repository<Invitation>,
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private membersRepo: Repository<OrganizationMember>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createDto: {
    organizationId: string;
    email: string;
    role: OrganizationRole;
    createdBy: string;
    message?: string;
  }): Promise<Invitation> {
    const organization = await this.organizationsRepo.findOne({
      where: { id: createDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingMember = await this.membersRepo.findOne({
      where: {
        organizationId: createDto.organizationId,
      },
      relations: ['user'],
    });

    if (existingMember?.user?.email === createDto.email) {
      throw new BadRequestException('User is already a member');
    }

    const existingInvitation = await this.invitationsRepo.findOne({
      where: {
        organizationId: createDto.organizationId,
        email: createDto.email,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation && existingInvitation.isValid()) {
      throw new BadRequestException('User already has a pending invitation');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationsRepo.create({
      organizationId: createDto.organizationId,
      email: createDto.email,
      role: createDto.role,
      token,
      expiresAt,
      createdBy: createDto.createdBy,
      message: createDto.message,
      status: InvitationStatus.PENDING,
    });

    return this.invitationsRepo.save(invitation);
  }

  async findByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationsRepo.findOne({
      where: { token },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.isExpired()) {
      invitation.markAsExpired();
      await this.invitationsRepo.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async accept(token: string, userId: string): Promise<OrganizationMember> {
    const invitation = await this.findByToken(token);

    if (!invitation.canAccept()) {
      throw new BadRequestException('Invitation cannot be accepted');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== invitation.email) {
      throw new UnauthorizedException('Email does not match invitation');
    }

    const existingMember = await this.membersRepo.findOne({
      where: {
        organizationId: invitation.organizationId,
        userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('Already a member of this organization');
    }

    const member = this.membersRepo.create({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      status: MemberStatus.ACTIVE,
      invitedBy: invitation.createdBy,
    });

    const savedMember = await this.membersRepo.save(member);

    await this.usersRepo.update(userId, {
      organizationId: invitation.organizationId,
    });

    invitation.markAsAccepted();
    await this.invitationsRepo.save(invitation);

    return savedMember;
  }

  async revoke(id: string): Promise<void> {
    const invitation = await this.invitationsRepo.findOne({ where: { id } });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.markAsRevoked();
    await this.invitationsRepo.save(invitation);
  }

  async findByOrganization(organizationId: string): Promise<Invitation[]> {
    return this.invitationsRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}
