import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';

import { UserRole, FileCategories, ServiceProviderType, FileCarRentalCategories } from 'src/types/enums';

import IndividualFileComponent from './individual-file-component';
import { FileDetail, getCategoryRelatedFiles } from './dealership-files';

type Props = {
  fileInfo: Record<string, any>[];
  services: Record<string, any>[];
  damage?: DamageModel;
}

export const signFiles = (services: Record<string, any>[], providerType: ServiceProviderType) => {
  let signingDocs: Record<string, any>[] = [];
  const files: Record<string, any>[] = [];

  services.forEach((service) => {
    if (service.providerInfo && service.providerInfo.serviceType === providerType && service.signingDoc) {
      signingDocs = [...service.signingDoc];
    }
  });
  if (signingDocs.length > 0) {
    signingDocs.forEach((doc) => {
      if (doc.fileURL) {
        files.push({ name: doc.fileName, fileUrl: doc.fileURL || "", uploadedAt: doc.createdAt.toMillis() / 1000, groupId: doc.fileURL || "" });
      }
    })
  }
  return files;
}

export default function CarRentalFiles({ fileInfo, services, damage }: Props) {
  // const { t } = useTranslate();
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const { user } = useAuthContext();
  const invoiceFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.CAR_RENTAL, FileCarRentalCategories.RENTAL_INVOICE), [fileInfo]);
  const contractFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.CAR_RENTAL, FileCarRentalCategories.RENTAL_CONTRACT), [fileInfo]);
  const insuranceFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.CAR_RENTAL, FileCarRentalCategories.ASSIGNMENT_INSURANCE), [fileInfo]);
  const repairApprovalFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.CAR_RENTAL, FileCarRentalCategories.REPAIR_APPROVAL), [fileInfo]);
  const miscellaneousFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.CAR_RENTAL, FileCarRentalCategories.MISCELLANEOUS), [fileInfo]);
  const outstandingClaimFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.CAR_RENTAL, FileCarRentalCategories.OUTSTANDING_CLAIMS), [fileInfo]);

  const getSignFiles = useCallback(() => signFiles(services, ServiceProviderType.CAR_RENTAL), [services]);

  const checkPermission = useCallback(async () => {
    if (user && [UserRole.CarRenter, UserRole.Admin].includes(user.role)) {
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
      {/* Car Rental Sign docs */}
      <IndividualFileComponent
        fileGroupId={invoiceFiles.groupId}
        category={FileCategories.CAR_RENTAL}
        subCategory="sign_documents"
        files={getSignFiles()}
        needUpload={false}
        isUploaded />
      <Divider />
      {/* Car Rental Invoice */}
      <IndividualFileComponent
        fileGroupId={invoiceFiles.groupId}
        category={FileCategories.CAR_RENTAL}
        subCategory={FileCarRentalCategories.RENTAL_INVOICE}
        files={invoiceFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={invoiceFiles.files.length > 0} />
      <Divider />
      {/* Cost Estimate */}
      <IndividualFileComponent
        fileGroupId={contractFiles.groupId}
        category={FileCategories.CAR_RENTAL}
        subCategory={FileCarRentalCategories.RENTAL_CONTRACT}
        files={contractFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={contractFiles.files.length > 0} />
      <Divider />
      {/* Assignment insurance */}
      <IndividualFileComponent
        fileGroupId={insuranceFiles.groupId}
        category={FileCategories.CAR_RENTAL}
        subCategory={FileCarRentalCategories.ASSIGNMENT_INSURANCE}
        files={insuranceFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={insuranceFiles.files.length > 0} />
      <Divider />
      {/* Repair Approval */}
      <IndividualFileComponent
        fileGroupId={repairApprovalFiles.groupId}
        category={FileCategories.CAR_RENTAL}
        subCategory={FileCarRentalCategories.REPAIR_APPROVAL}
        files={repairApprovalFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={repairApprovalFiles.files.length > 0} />
      <Divider />
      {/* Outstanding Claims */}
      <IndividualFileComponent
        fileGroupId={outstandingClaimFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileCarRentalCategories.OUTSTANDING_CLAIMS}
        files={outstandingClaimFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={outstandingClaimFiles.files.length > 0} />
      <Divider />
      {/* Miscellaneous */}
      <IndividualFileComponent
        fileGroupId={miscellaneousFiles.groupId}
        category={FileCategories.CAR_RENTAL}
        subCategory={FileCarRentalCategories.MISCELLANEOUS}
        files={miscellaneousFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={miscellaneousFiles.files.length > 0} />
    </Stack>
  )
}
