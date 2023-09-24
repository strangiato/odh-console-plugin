import { K8sResourceCommon } from "@openshift-console/dynamic-plugin-sdk";

export type NotebookKind = K8sResourceCommon & {
  status?: {
    readyReplicas: number;
  };
};
