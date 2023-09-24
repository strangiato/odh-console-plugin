import React from 'react';
import { NotebookKind,  } from '@notebooks-model/types';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  Timestamp,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { useODHTranslation } from '@odh-utils/hooks/useODHTranslation';
import { notebookGroupVersionKind, namespaceGroupVersionKind } from '@odh-utils/utils';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type NotebookListProps = {
  namespace: string;
};

const NotebookList: React.FC<NotebookListProps> = ({ namespace }) => {
  const [notebooks, loaded, loadError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    groupVersionKind: notebookGroupVersionKind,
    namespaced: true,
    namespace,
  });
  const { t } = useODHTranslation();
  const columns = useNotebookColumns();
  const [data, filteredData, onFilterChange] = useListPageFilter(notebooks);

  return (
    <>
      <ListPageHeader title={t('Notebooks')}>
        {/* groupVersionKind should take an object but there is discrepancy in the prop types
        https://issues.redhat.com/browse/OCPBUGS-13808 will update the types */}
        <ListPageCreate groupVersionKind={"kubeflow.org~v1~Notebook"}>Create Notebook</ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter data={data} loaded={loaded} onFilterChange={onFilterChange} />
        <VirtualizedTable<K8sResourceCommon>
          data={filteredData}
          unfilteredData={notebooks}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={notebookListRow}
        />
      </ListPageBody>
    </>
  );
};

const notebookListRow: React.FC<RowProps<NotebookKind>> = ({ obj, activeColumnIDs }) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} >
        <ResourceLink
          groupVersionKind={notebookGroupVersionKind}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs} >
        <ResourceLink groupVersionKind={namespaceGroupVersionKind} name={obj.metadata.namespace} />
      </TableData>
      <TableData id="replicas" activeColumnIDs={activeColumnIDs}>
        {obj.status.readyReplicas}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs} >
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
    </>
  );
};

const useNotebookColumns = () => {
  const { t } = useODHTranslation();
  const columns: TableColumn<K8sResourceCommon>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
      },
      {
        title: t('Namespace'),
        id: 'namespace',
        transforms: [sortable],
        sort: 'metadata.namespace',
      },
      {
        title: t('Replicas'),
        id: 'replicas',
        transforms: [sortable],
        sort: 'status.readyReplicas',
      },
      {
        title: t('Created'),
        id: 'created',
        transforms: [sortable],
        sort: 'metadata.creationTimestamp',
      },
    ],
    [],
  );

  return columns;
};

export default NotebookList;
