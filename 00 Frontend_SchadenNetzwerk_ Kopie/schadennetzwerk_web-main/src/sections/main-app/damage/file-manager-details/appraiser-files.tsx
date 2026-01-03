import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { useAuthContext } from 'src/auth/hooks';

import { UserRole, FileCategories, ServiceProviderType, FileAppraiserCategories } from 'src/types/enums';

import { signFiles } from './car-rental-files';
import IndividualFileComponent from './individual-file-component';
import { FileDetail, getCategoryRelatedFiles } from './dealership-files';

type Props = {
  fileInfo: Record<string, any>[];
  services: Record<string, any>[];
}

export default function AppraiserFiles({ fileInfo, services }: Props) {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const { user } = useAuthContext();

  const expertOpinionFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.APPRAISER, FileAppraiserCategories.EXPERT_OPINION), [fileInfo]);
  const invoiceFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.APPRAISER, FileAppraiserCategories.APPRAISER_INVOICE), [fileInfo]);
  const reportFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.APPRAISER, FileAppraiserCategories.ACCIDENT_REPORT), [fileInfo]);
  const otherFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.APPRAISER, FileAppraiserCategories.MISCELLANEOUS), [fileInfo]);
  const repairApprovalFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.APPRAISER, FileAppraiserCategories.REPAIR_APPROVAL), [fileInfo]);
  const outstandingClaimFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.APPRAISER, FileAppraiserCategories.OUTSTANDING_CLAIMS), [fileInfo]);
  const getSignFiles = useCallback(() => signFiles(services, ServiceProviderType.APPRAISER), [services]);

  const checkPermission = useCallback(async () => {
    if (user && [UserRole.Appraiser, UserRole.Admin].includes(user.role)) {
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
      {/* Gutachten File */}
      <IndividualFileComponent
        fileGroupId={expertOpinionFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory="sign_documents"
        files={getSignFiles()}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded />
      <Divider />
      {/* Gutachten File */}
      <IndividualFileComponent
        fileGroupId={expertOpinionFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileAppraiserCategories.EXPERT_OPINION}
        files={expertOpinionFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={expertOpinionFiles.files.length > 0} />
      <Divider />
      {/* Appraiser Invoice */}
      <IndividualFileComponent
        fileGroupId={invoiceFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileAppraiserCategories.APPRAISER_INVOICE}
        files={invoiceFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={invoiceFiles.files.length > 0} />
      <Divider />
      {/* Accident Report */}
      <IndividualFileComponent
        fileGroupId={reportFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileAppraiserCategories.ACCIDENT_REPORT}
        files={reportFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={reportFiles.files.length > 0} />
      <Divider />
      {/* Repair Approval */}
      <IndividualFileComponent
        fileGroupId={repairApprovalFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileAppraiserCategories.REPAIR_APPROVAL}
        files={repairApprovalFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={repairApprovalFiles.files.length > 0} />
      <Divider />
      {/* Outstanding Claims */}
      <IndividualFileComponent
        fileGroupId={outstandingClaimFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileAppraiserCategories.OUTSTANDING_CLAIMS}
        files={outstandingClaimFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={outstandingClaimFiles.files.length > 0} />
      <Divider />
      {/* Other files */}
      <IndividualFileComponent
        fileGroupId={otherFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileAppraiserCategories.MISCELLANEOUS}
        files={otherFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={otherFiles.files.length > 0} />
    </Stack>
  )
}
