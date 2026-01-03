import { useMemo } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// import { useTranslate } from 'src/locales';

import { FileCategories, FileOthersCategories } from 'src/types/enums';

import IndividualFileComponent from './individual-file-component';
import { FileDetail, getCategoryRelatedFiles } from './dealership-files';

type Props = {
  fileInfo: Record<string, any>[]
  isCustomer?: boolean;
}

export default function OtherFiles({ fileInfo, isCustomer }: Props) {
  // const { t } = useTranslate();
  const vrcFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.OTHER_FILES, FileOthersCategories.VRC), [fileInfo]);
  const otherFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.OTHER_FILES, FileOthersCategories.PURCHASE_CONTRACT), [fileInfo]);
  const miscellaneousFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.OTHER_FILES, FileOthersCategories.MISCELLANEOUS), [fileInfo]);
  return (
    <Stack spacing={3} direction="column" width="95%">
      {/* Vehicle registration certificate */}
      <IndividualFileComponent
        fileGroupId={vrcFiles.groupId}
        category={FileCategories.OTHER_FILES}
        subCategory={FileOthersCategories.VRC}
        files={vrcFiles.files}
        needUpload={!isCustomer}
        isUploaded={vrcFiles.files.length > 0} />
      <Divider />
      {/* Purchase contract */}
      <IndividualFileComponent
        fileGroupId={otherFiles.groupId}
        category={FileCategories.OTHER_FILES}
        subCategory={FileOthersCategories.PURCHASE_CONTRACT}
        files={otherFiles.files}
        needUpload={!isCustomer}
        isUploaded={otherFiles.files.length > 0} />
      <Divider />
      {/* Miscellaneous */}
      <IndividualFileComponent
        fileGroupId={miscellaneousFiles.groupId}
        category={FileCategories.OTHER_FILES}
        subCategory={FileOthersCategories.MISCELLANEOUS}
        files={miscellaneousFiles.files}
        needUpload={!isCustomer}
        isUploaded={miscellaneousFiles.files.length > 0} />
    </Stack>
  )
}
