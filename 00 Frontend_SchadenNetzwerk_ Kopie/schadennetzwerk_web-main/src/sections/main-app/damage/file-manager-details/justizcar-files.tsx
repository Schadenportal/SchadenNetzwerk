import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// import { useTranslate } from 'src/locales';
import { useMainData } from 'src/providers/data-provider';

import { FileCategories, ServiceProviderType, FileJustizcarCategories } from 'src/types/enums';

import { signFiles } from './car-rental-files';
import IndividualFileComponent from './individual-file-component';
import { FileDetail, getCategoryRelatedFiles } from './dealership-files';

type Props = {
  fileInfo: Record<string, any>[];
  services: Record<string, any>[];
}

export default function JustizcarFiles({ fileInfo, services }: Props) {
  // const { t } = useTranslate();
  const { serviceProvider } = useMainData();

  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);

  const powerOfAttorneyFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.POWER_OF_ATTORNEY), [fileInfo]);
  const liabilityInquiryFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.LIABILITY_INQUIRY), [fileInfo]);
  const notificationFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.NOTIFICATION_TO_INSURANCE), [fileInfo]);
  const communicationFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.COMMUNICATION_TO_INSURANCE), [fileInfo]);
  const settlementFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.INSURANCE_SETTLEMENT), [fileInfo]);
  const accidentReportFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.ACCIDENT_REPORT), [fileInfo]);
  const miscellaneousFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.MISCELLANEOUS), [fileInfo]);
  const courtMailFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.COURT_MAIL), [fileInfo]);
  const repairApprovalFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.REPAIR_APPROVAL), [fileInfo]);
  const outstandingClaimFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.JUSTIZCAR, FileJustizcarCategories.OUTSTANDING_CLAIMS), [fileInfo]);
  const getSignFiles = useCallback(() => signFiles(services, ServiceProviderType.ATTORNEY), [services]);

  const checkPermission = useCallback(async () => {
    if (serviceProvider && serviceProvider.serviceType === ServiceProviderType.ATTORNEY) {
      setIsPermissionGranted(true);
    } else {
      setIsPermissionGranted(false);
    }
  }, [serviceProvider]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return (
    <Stack spacing={3} direction="column" width="95%">
      {/* POWER_OF_ATTORNEY */}
      <IndividualFileComponent
        fileGroupId={powerOfAttorneyFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory="sign_documents"
        files={getSignFiles()}
        needUpload={false}
        isUploaded />
      <Divider />
      {/* POWER_OF_ATTORNEY */}
      <IndividualFileComponent
        fileGroupId={powerOfAttorneyFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.POWER_OF_ATTORNEY}
        files={powerOfAttorneyFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={powerOfAttorneyFiles.files.length > 0} />
      <Divider />
      {/* LIABILITY_INQUIRY */}
      <IndividualFileComponent
        fileGroupId={liabilityInquiryFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.LIABILITY_INQUIRY}
        files={liabilityInquiryFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={liabilityInquiryFiles.files.length > 0} />
      <Divider />
      {/* Notification to insurance */}
      <IndividualFileComponent
        fileGroupId={notificationFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.NOTIFICATION_TO_INSURANCE}
        files={notificationFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={notificationFiles.files.length > 0} />
      <Divider />
      {/* Notification to insurance */}
      <IndividualFileComponent
        fileGroupId={communicationFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.COMMUNICATION_TO_INSURANCE}
        files={communicationFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={communicationFiles.files.length > 0} />
      <Divider />
      {/* Notification to insurance */}
      <IndividualFileComponent
        fileGroupId={settlementFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.INSURANCE_SETTLEMENT}
        files={settlementFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={settlementFiles.files.length > 0} />
      <Divider />
      {/* Notification to insurance */}
      <IndividualFileComponent
        fileGroupId={accidentReportFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.ACCIDENT_REPORT}
        files={accidentReportFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={accidentReportFiles.files.length > 0} />
      <Divider />
      {/* Repair Approval */}
      <IndividualFileComponent
        fileGroupId={repairApprovalFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.REPAIR_APPROVAL}
        files={repairApprovalFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={repairApprovalFiles.files.length > 0} />
      <Divider />
      {/* Court mail */}
      <IndividualFileComponent
        fileGroupId={courtMailFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.COURT_MAIL}
        files={courtMailFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={courtMailFiles.files.length > 0} />
      <Divider />
      {/* Outstanding Claims */}
      <IndividualFileComponent
        fileGroupId={outstandingClaimFiles.groupId}
        category={FileCategories.APPRAISER}
        subCategory={FileJustizcarCategories.OUTSTANDING_CLAIMS}
        files={outstandingClaimFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={outstandingClaimFiles.files.length > 0} />
      <Divider />
      {/* Miscellaneous */}
      <IndividualFileComponent
        fileGroupId={miscellaneousFiles.groupId}
        category={FileCategories.JUSTIZCAR}
        subCategory={FileJustizcarCategories.MISCELLANEOUS}
        files={miscellaneousFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={miscellaneousFiles.files.length > 0} />
    </Stack>
  )
}
