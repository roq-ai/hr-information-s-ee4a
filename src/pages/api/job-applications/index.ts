import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { authorizationValidationMiddleware, errorHandlerMiddleware } from 'server/middlewares';
import { jobApplicationValidationSchema } from 'validationSchema/job-applications';
import { convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  switch (req.method) {
    case 'GET':
      return getJobApplications();
    case 'POST':
      return createJobApplication();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getJobApplications() {
    const data = await prisma.job_application
      .withAuthorization({
        roqUserId,
        tenantId: user.tenantId,
        roles: user.roles,
      })
      .findMany(convertQueryToPrismaUtil(req.query, 'job_application'));
    return res.status(200).json(data);
  }

  async function createJobApplication() {
    await jobApplicationValidationSchema.validate(req.body);
    const body = { ...req.body };

    const data = await prisma.job_application.create({
      data: body,
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
