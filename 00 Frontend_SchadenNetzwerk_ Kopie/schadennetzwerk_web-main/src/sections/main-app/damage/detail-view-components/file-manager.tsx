import React, { useState, useEffect, useCallback } from 'react';

import { useTranslate } from "src/locales";
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { useMainData } from 'src/providers/data-provider';
import { WORKSHOP_ROLES } from 'src/constants/viewConstants';
import { getDamageFilesByDamageId } from 'src/services/firebase/firebaseFirestore';

import { UserRole, ServiceProviderType } from 'src/types/enums';

import ComponentBlock from "./component-block";
import OtherFiles from '../file-manager-details/other-files';
import AppraiserFiles from '../file-manager-details/appraiser-files';
import JustizcarFiles from '../file-manager-details/justizcar-files';
import CarRentalFiles from '../file-manager-details/car-rental-files';
import PaintShopFiles from '../file-manager-details/paint-shop-files';
import DealershipFiles from '../file-manager-details/dealership-files';

type Props = {
  services: Record<string, any>[];
  damage?: DamageModel;
  isCustomer?: boolean;
}

type PermissionObj = {
  dealership: boolean;
  appraiser: boolean;
  carRental: boolean;
  justizcar: boolean;
  other: boolean;
  paintShop: boolean;
}

export default function FileManager({ services, damage, isCustomer }: Props) {
  const { t } = useTranslate();
  const { serviceProvider } = useMainData();
  const { user } = useAuthContext();

  const [fileInfo, setFileInfo] = useState<Record<string, any>[]>([]);
  const [sectionPermissions, setSectionPermissions] = useState<PermissionObj>({ dealership: false, appraiser: false, carRental: false, justizcar: false, other: false, paintShop: false });

  const handleSuccess = useCallback(async (list: Record<string, any>[]) => {
    console.log("files ===", list)
    setFileInfo(list);
  }, []);

  const getSectionPermission = useCallback(async () => {
    if (user) {
      if (user.role === UserRole.Lawyer) {
        setSectionPermissions({ dealership: true, appraiser: true, carRental: true, justizcar: true, other: true, paintShop: true });
      } else if (WORKSHOP_ROLES.includes(user.role)) {
        setSectionPermissions({ dealership: true, appraiser: true, carRental: true, justizcar: true, other: true, paintShop: true });
      } else if (serviceProvider) {
        if (serviceProvider.serviceType === ServiceProviderType.APPRAISER) {
          setSectionPermissions({ dealership: false, appraiser: true, carRental: false, justizcar: false, other: false, paintShop: false });
        } else if (serviceProvider.serviceType === ServiceProviderType.CAR_RENTAL) {
          setSectionPermissions({ dealership: false, appraiser: false, carRental: true, justizcar: false, other: false, paintShop: false });
        } else if (serviceProvider.serviceType === ServiceProviderType.ATTORNEY) {
          setSectionPermissions({ dealership: true, appraiser: true, carRental: true, justizcar: true, other: true, paintShop: true });
        } else if (serviceProvider.serviceType === ServiceProviderType.PAINT_SHOP) {
          setSectionPermissions({ dealership: false, appraiser: false, carRental: false, justizcar: false, other: false, paintShop: true });
        }
      }
    }
  }, [serviceProvider, user]);

  useEffect(() => {
    if (damage) {
      getSectionPermission();
      const unSubscribe = getDamageFilesByDamageId(damage.damageId, handleSuccess);
      return () => {
        unSubscribe();
      }
    }
    return () => { };
  }, [damage, getSectionPermission, handleSuccess]);

  return (
    <>
      {(isCustomer || sectionPermissions.dealership) && (
        <ComponentBlock title={t('dealership')} spacing={0} sx={{ p: 1 }}>
          <DealershipFiles fileInfo={fileInfo} damage={damage} />
        </ComponentBlock>
      )}
      {(isCustomer || sectionPermissions.appraiser) && (<ComponentBlock title={t('appraiser')} spacing={0} sx={{ p: 1 }}>
        <AppraiserFiles fileInfo={fileInfo} services={services} />
      </ComponentBlock>)}
      {(isCustomer || sectionPermissions.carRental) && (<ComponentBlock title={t('car_rental_accident_replacement')} spacing={0} sx={{ p: 1 }}>
        <CarRentalFiles fileInfo={fileInfo} services={services} damage={damage} />
      </ComponentBlock>)}
      {(isCustomer || sectionPermissions.justizcar) && (<ComponentBlock title={t('justizcar')} spacing={0} sx={{ p: 1 }}>
        <JustizcarFiles fileInfo={fileInfo} services={services} />
      </ComponentBlock>)}
      {(isCustomer || sectionPermissions.paintShop) && (
        <ComponentBlock title={t('paint_shop')} spacing={0} sx={{ p: 1 }}>
          <PaintShopFiles fileInfo={fileInfo} services={services} />
        </ComponentBlock>
      )}
      {(isCustomer || sectionPermissions.other) && (
        <ComponentBlock title={t('other_files')} spacing={0} sx={{ p: 1 }}>
          <OtherFiles fileInfo={fileInfo} isCustomer />
        </ComponentBlock>
      )}
    </>
  )
}
