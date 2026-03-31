import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Index from "./Index";

const IndexEN = () => {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage("en");
  }, [setLanguage]);

  return <Index />;
};

export default IndexEN;
