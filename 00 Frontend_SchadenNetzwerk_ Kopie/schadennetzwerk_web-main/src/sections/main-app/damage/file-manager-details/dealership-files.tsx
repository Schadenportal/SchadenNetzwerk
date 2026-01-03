
import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { getFileNameFromURL } from 'src/services/firebase/firebaseStorage';

import { UserRole, FileCategories, FileDealershipCategories } from 'src/types/enums';

import IndividualFileComponent from './individual-file-component';

type Props = {
  fileInfo: Record<string, any>[];
  damage?: DamageModel;
}

export type FileDetail = {
  files: Record<string, any>[];
  groupId: string;
}

export function getCategoryRelatedFiles(fileInfo: Record<string, any>[], category: FileCategories, subCategory: string) {
  const categoryFileInfo = fileInfo.filter((item) => item.category === category && item.subCategory === subCategory);
  if (categoryFileInfo.length === 1) {
    return { files: categoryFileInfo[0].files, groupId: categoryFileInfo[0].fileGroupId };
  }
  return { files: [], groupId: "" };
}

export default function DealershipFiles({ fileInfo, damage }: Props) {
  // const { t } = useTranslate();
  const { user } = useAuthContext();
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);

  const orderFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.DEALERSHIP, FileDealershipCategories.ORDER), [fileInfo]);
  const costEstimateFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.DEALERSHIP, FileDealershipCategories.COST_ESTIMATE), [fileInfo]);
  const invoiceFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.DEALERSHIP, FileDealershipCategories.REPAIR_INVOICE), [fileInfo]);
  const repairApprovalFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.DEALERSHIP, FileDealershipCategories.REPAIR_APPROVAL), [fileInfo]);
  const miscellaneousFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.DEALERSHIP, FileDealershipCategories.MISCELLANEOUS), [fileInfo]);
  const outstandingClaimFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.DEALERSHIP, FileDealershipCategories.OUTSTANDING_CLAIMS), [fileInfo]);

  const rkuFile = useCallback(() => {
    if (damage && damage.assignmentDoc) {
      return [{ name: getFileNameFromURL(damage.assignmentDoc), fileUrl: damage.assignmentDoc, uploadedAt: damage.createdAt.toMillis() / 1000, groupId: damage.assignmentDoc }];
    }
    return null;
  }, [damage]);

  const repairPlanFile = useCallback(() => {
    if (damage && damage.repairScheduleDoc) {
      return [{ name: getFileNameFromURL(damage.repairScheduleDoc), fileUrl: damage.repairScheduleDoc, uploadedAt: damage.createdAt.toMillis() / 1000, groupId: damage.repairScheduleDoc }];
    }
    return null;
  }, [damage]);

  const checkPermission = useCallback(async () => {
    if (user && [UserRole.Owner, UserRole.ServiceAdviser, UserRole.Admin].includes(user.role)) {
      setIsPermissionGranted(true);
    } else {
      setIsPermissionGranted(false);
    }
  }, [user]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return (
    <Stack spacing={3} direction="column" width="95%">
      {/* RKU File */}
      <IndividualFileComponent
        fileGroupId={orderFiles.groupId}
        category={FileCategories.DEALERSHIP}
        subCategory={FileDealershipCategories.ORDER}
        files={[...(rkuFile() || []), ...(repairPlanFile() || []), ...orderFiles.files]}
        needUpload={false}
        isUploaded={orderFiles.files.length > 0} />
      <Divider />
      {/* Cost Estimate */}
      <IndividualFileComponent
        fileGroupId={costEstimateFiles.groupId}
        category={FileCategories.DEALERSHIP}
        subCategory={FileDealershipCategories.COST_ESTIMATE}
        files={costEstimateFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={costEstimateFiles.files.length > 0} />
      <Divider />
      {/* Repair Invoice */}
      <IndividualFileComponent
        fileGroupId={invoiceFiles.groupId}
        category={FileCategories.DEALERSHIP}
        subCategory={FileDealershipCategories.REPAIR_INVOICE}
        files={invoiceFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={invoiceFiles.files.length > 0} />
      <Divider />
      {/* Repair Approval */}
      <IndividualFileComponent
        fileGroupId={repairApprovalFiles.groupId}
        category={FileCategories.DEALERSHIP}
        subCategory={FileDealershipCategories.REPAIR_APPROVAL}
        files={repairApprovalFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={repairApprovalFiles.files.length > 0} />
      <Divider />
      {/* Outstanding Claims */}
      <IndividualFileComponent
        fileGroupId={outstandingClaimFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileDealershipCategories.OUTSTANDING_CLAIMS}
        files={outstandingClaimFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={outstandingClaimFiles.files.length > 0} />
      <Divider />
      {/* Miscellaneous */}
      <IndividualFileComponent
        fileGroupId={miscellaneousFiles.groupId}
        category={FileCategories.DEALERSHIP}
        subCategory={FileDealershipCategories.MISCELLANEOUS}
        files={miscellaneousFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={miscellaneousFiles.files.length > 0} />
    </Stack>
  )
}
