import { createContext, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export const AppContext = createContext<AppContext | null>(null);

const AppProvider: React.FC<Props> = ({ children }) => {
  const [formToUpdate, setFormToUpdate] = useState<Form | null>(null);
  const [formToPreview, setFormToPreview] = useState<Form | null>(null);
  const [formToPopulate, setFormToPopulate] = useState<Form | null>(null);

  return (
    <AppContext.Provider
      value={{
        formToUpdate,
        formToPreview,
        formToPopulate,
        setFormToUpdate,
        setFormToPreview,
        setFormToPopulate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
