import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { signToken } from '../utils/jwt.js';

const employeeSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
};

export async function register(req, res) {
  const { name, email, password } = req.validatedBody;

  const existing = await prisma.employee.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new HttpError(409, 'An account with this email already exists', 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let employee;
  try {
    employee = await prisma.employee.create({
      data: { name, email, passwordHash },
      select: employeeSelect,
    });
  } catch (error) {
    // Handles the race where two registrations with the same email arrive together.
    if (error.code === 'P2002') {
      throw new HttpError(409, 'An account with this email already exists', 'EMAIL_IN_USE');
    }
    throw error;
  }

  const token = signToken(employee.id);

  return res.status(201).json({ data: { employee, token } });
}

export async function login(req, res) {
  const { email, password } = req.validatedBody;

  const employee = await prisma.employee.findUnique({ where: { email } });
  const isValid = employee ? await bcrypt.compare(password, employee.passwordHash) : false;

  if (!isValid) {
    throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = signToken(employee.id);

  return res.json({
    data: {
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        createdAt: employee.createdAt,
      },
      token,
    },
  });
}

export async function me(req, res) {
  const employee = await prisma.employee.findUnique({
    where: { id: req.user.id },
    select: employeeSelect,
  });

  if (!employee) {
    throw new HttpError(401, 'Account no longer exists', 'INVALID_TOKEN');
  }

  return res.json({ data: { employee } });
}
