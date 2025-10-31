interface RegisterAdminContext {
  navigateOtpSection: () => void;
  navigateDetailsSection: () => void;
  navigatePasswordSection: () => void;
  registerPayload: React.MutableRefObject<RegisterAdminPayload>;
}

interface RegisterUserContext {
  navigateOtpSection: () => void;
  navigateCardSection: () => void;
  navigateDetailsSection: () => void;
  navigatePasswordSection: () => void;
  registerPayload: React.MutableRefObject<RegisterUserPayload>;
}

interface AppContext {
  formToUpdate: Form | null;
  formToPreview: Form | null;
  formToPopulate: Form | null;
  setFormToUpdate: React.Dispatch<React.SetStateAction<Form | null>>;
  setFormToPreview: React.Dispatch<React.SetStateAction<Form | null>>;
  setFormToPopulate: React.Dispatch<React.SetStateAction<Form | null>>;
}
