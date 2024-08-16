import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';
import { Public } from '../common/decorators';
import { FunReport } from './types';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @ApiOperation({
    summary: 'Get a report of posts',
    description: 'Allows to get a public report of posts.',
  })
  @ApiResponse({
    status: 200,
    description: 'The report was successfully generated.',
    example: [
      {
        title: 'First Post !!',
        numberOfComments: 2,
        views: 1,
        likes: 1,
        dislikes: 0,
      },
    ],
  })
  @Public()
  @Get()
  getPost(): Promise<FunReport> {
    return this.reportService.generateReport();
  }
}
