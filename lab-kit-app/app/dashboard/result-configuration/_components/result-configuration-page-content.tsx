import type { ResultConfiguration } from "@/lib/result-configuration/configuration";
import { getResultConfigurationSummary } from "@/lib/result-configuration/configuration";

import { ResultConfigurationClient } from "./result-configuration-client";

type ResultConfigurationPageContentProps = {
  config: ResultConfiguration;
};

export function ResultConfigurationPageContent({
  config,
}: ResultConfigurationPageContentProps) {
  return (
    <ResultConfigurationClient
      config={config}
      summary={getResultConfigurationSummary(config)}
    />
  );
}
