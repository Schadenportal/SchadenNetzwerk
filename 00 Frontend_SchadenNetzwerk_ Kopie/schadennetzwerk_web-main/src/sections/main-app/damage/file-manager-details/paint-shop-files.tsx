import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { useAuthContext } from 'src/auth/hooks';

import { UserRole, FileCategories, FilePaintShopCategories } from 'src/types/enums';

import IndividualFileComponent from './individual-file-component';
import { FileDetail, getCategoryRelatedFiles } from './dealership-files';

type Props = {
  fileInfo: Record<string, any>[];
  services: Record<string, any>[];
}

export default function PaintShopFiles({ fileInfo, services }: Props) {
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const { user } = useAuthContext();

  const orderFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.PAINT_SHOP, FilePaintShopCategories.PAINT_SHOP_ORDER), [fileInfo]);
  const otherFiles: FileDetail = useMemo(() => getCategoryRelatedFiles(fileInfo, FileCategories.PAINT_SHOP, FilePaintShopCategories.MISCELLANEOUS), [fileInfo]);

  const checkPermission = useCallback(async () => {
    if (user && [UserRole.Lawyer, UserRole.PaintShop, UserRole.Owner, UserRole.Admin, UserRole.ServiceAdviser].includes(user.role)) {
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
      {/* Order files */}
      <IndividualFileComponent
        fileGroupId={orderFiles.groupId}
        category={FileCategories.PAINT_SHOP}
        subCategory={FilePaintShopCategories.PAINT_SHOP_ORDER}
        files={orderFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded />
      <Divider />
      {/* Other files */}
      <IndividualFileComponent
        fileGroupId={otherFiles.groupId}
        category={FileCategories.PAINT_SHOP}
        subCategory={FilePaintShopCategories.MISCELLANEOUS}
        files={otherFiles.files}
        needUpload={isPermissionGranted}
        shouldShowDelete={isPermissionGranted}
        isUploaded={otherFiles.files.length > 0} />
    </Stack>
  )
}
