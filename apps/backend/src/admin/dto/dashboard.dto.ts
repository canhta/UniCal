import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Total number of client users in the system',
  })
  totalClientUsers: number;

  @ApiProperty({
    description: 'Total number of admin users in the system',
  })
  totalAdminUsers: number;

  @ApiProperty({
    description: 'Number of new user registrations this month',
  })
  newRegistrationsThisMonth: number;

  @ApiProperty({
    description: 'Number of active subscriptions',
  })
  activeSubscriptions: number;

  @ApiProperty({
    description: 'Number of pending leads',
  })
  pendingLeads: number;

  @ApiProperty({
    description: 'Total revenue this month',
  })
  revenueThisMonth: number;

  @ApiProperty({
    description: 'Percentage growth in users compared to last month',
  })
  userGrowthPercentage: number;
}

export class SearchResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: 'client_user' | 'admin_user' | 'lead';

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  additionalInfo?: string;
}
