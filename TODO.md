# TODO
- [ ] Gather UI expectations for “property details” section on the property page (from existing code or design mockups).
- [x] Identify which fields are missing for each sample property card/details on `/src/app/properties/[id]/page.tsx` (existing fields: status, lastSupervisedAt, nextSupervisionDue).
- [x] Add a “Property details” block that renders fields per property using existing `Property` fields (status, lastSupervisedAt, nextSupervisionDue).
- [ ] If the backend model lacks those fields, add client-side sample data mapping for the existing 16 `SAMPLE_PROPERTIES`.
- [ ] Ensure TypeScript types stay consistent (extend local sample type safely, or update `Property` type if needed).
- [ ] Validate build/lint and run relevant tests (at least `npm run lint` and `npm run build`).

