import * as yup from 'yup';

export const jobApplicationValidationSchema = yup.object().shape({
  applicant_name: yup.string().required(),
  applicant_email: yup.string().required(),
  resume: yup.string().required(),
  company_id: yup.string().nullable(),
});
