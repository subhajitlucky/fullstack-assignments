import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';

function paginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createEnquiry(req, res) {
  const enquiry = await prisma.enquiry.create({ data: req.validatedBody });

  return res.status(201).json({ data: enquiry });
}

export async function listUnclaimed(req, res) {
  const { page, limit } = req.validatedQuery;
  const where = { claimedById: null };

  const [items, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.enquiry.count({ where }),
  ]);

  return res.json({ data: items, meta: paginationMeta(total, page, limit) });
}

export async function listMine(req, res) {
  const { page, limit } = req.validatedQuery;
  const where = { claimedById: req.user.id };

  const [items, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where,
      orderBy: [{ claimedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.enquiry.count({ where }),
  ]);

  return res.json({ data: items, meta: paginationMeta(total, page, limit) });
}

export async function claimEnquiry(req, res) {
  const { id } = req.validatedParams;

  // Single conditional UPDATE: the database decides the winner when two
  // counselors claim the same enquiry at the same time.
  const result = await prisma.enquiry.updateMany({
    where: { id, claimedById: null },
    data: {
      claimedById: req.user.id,
      claimedAt: new Date(),
    },
  });

  if (result.count === 0) {
    const existing = await prisma.enquiry.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new HttpError(404, 'Enquiry not found', 'ENQUIRY_NOT_FOUND');
    }

    throw new HttpError(409, 'Enquiry has already been claimed', 'ENQUIRY_ALREADY_CLAIMED');
  }

  const enquiry = await prisma.enquiry.findUnique({ where: { id } });

  return res.json({ data: enquiry });
}
