import { Router, Response } from 'express';
import { Domain } from '../models';
import { cloudflareService } from '../services/cloudflare.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler, AppError } from '../middlewares/error.middleware';
import { createDomainSchema, createDNSRecordSchema, updateDNSRecordSchema } from '../validation/schemas';
import { AuthRequest } from '../types';

const router = Router();

router.use(authMiddleware);

const findDomainOrFail = async (id: string) => {
  const domain = await Domain.findById(id);
  if (!domain) {
    throw new AppError(404, 'Domain not found');
  }
  return domain;
};

router.get(
  '/',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const domains = await Domain.find().sort({ createdAt: -1 }).lean();
    res.json(domains);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const domain = await findDomainOrFail(req.params.id);
    const dnsRecords = await cloudflareService.listDNSRecords(domain.zoneId);
    res.json({ domain, dnsRecords });
  })
);

router.post(
  '/',
  validate(createDomainSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const normalizedName = name.toLowerCase();

    const existingDomain = await Domain.findOne({ name: normalizedName });
    if (existingDomain) {
      throw new AppError(400, 'Domain already registered');
    }

    const zone = await cloudflareService.createZone(normalizedName);

    const domain = await Domain.create({
      name: normalizedName,
      zoneId: zone.id,
      nameServers: zone.name_servers,
      status: zone.status,
    });

    res.status(201).json(domain);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const domain = await Domain.findByIdAndDelete(req.params.id);
    if (!domain) {
      throw new AppError(404, 'Domain not found');
    }
    res.json({ message: 'Domain deleted' });
  })
);

router.get(
  '/:id/dns',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const domain = await findDomainOrFail(req.params.id);
    const records = await cloudflareService.listDNSRecords(domain.zoneId);
    res.json(records);
  })
);

router.post(
  '/:id/dns',
  validate(createDNSRecordSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const domain = await findDomainOrFail(req.params.id);
    const { type, name, content, ttl, proxied } = req.body;

    const record = await cloudflareService.createDNSRecord(
      domain.zoneId,
      type,
      name,
      content,
      ttl,
      proxied
    );

    res.status(201).json(record);
  })
);

router.put(
  '/:id/dns/:recordId',
  validate(updateDNSRecordSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const domain = await findDomainOrFail(req.params.id);
    const { type, name, content, ttl, proxied } = req.body;

    const record = await cloudflareService.updateDNSRecord(
      domain.zoneId,
      req.params.recordId,
      type,
      name,
      content,
      ttl,
      proxied
    );

    res.json(record);
  })
);

router.delete(
  '/:id/dns/:recordId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const domain = await findDomainOrFail(req.params.id);
    await cloudflareService.deleteDNSRecord(domain.zoneId, req.params.recordId);
    res.json({ message: 'DNS record deleted' });
  })
);

export const domainRouter = router;
