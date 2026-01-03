import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@react-pdf-viewer/core/lib/styles/index.css';
import { yupResolver } from '@hookform/resolvers/yup';
// eslint-disable-next-line import/no-extraneous-dependencies
import { rgb, PDFDocument, StandardFonts } from "pdf-lib";
// eslint-disable-next-line import/no-extraneous-dependencies
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Step from '@mui/material/Step';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import Iconify from '../iconify';
import { ConfirmDialogProps } from './types';
import { CustomDatePicker } from '../date-picker';
import FormProvider, { RHFCheckbox, RHFTextField } from '../hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  parties: {
    client: {
      company: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
    contractor: {
      company: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  vehicle: {
    makeModel: string;
    vin: string;
    licensePlate: string;
    paintCode: string;
    mileageKm: number | null;
  };
  scope: {
    partialPainting: {
      selected: boolean;
      components?: string;
    };
    fullPainting: boolean;
    blendAdjacentParts: boolean;
    surfacePrep: boolean;
    dismantleReassemble: {
      selected: boolean;
      notes?: string;
    };
    plasticOrAluminumRepair: boolean;
    corrosionProtection: boolean;
    paintFinishPolish: boolean;
  };
  documentation: {
    preExistingDamage: string;
    photoDocumentationByContractor: boolean | null;
  };
  deadlines: {
    deliveryAt: any | null;
    estimatedCompletionAt: any | null;
    pickupByDate: any | null;
  };
  priceApproval: {
    appraisalRef: string;
    appraisalSystem: string;
    totalNetEUR: number | null;
    vatEUR: number | null;
    termsDays: string | null;
  };
  partsDisposal: {
    oldPartsDisposed: boolean | null;
    oldPartsReturned: boolean | null;
    disposalCosts: {
      includedInInvoice: boolean | null;
      listedSeparately: boolean | null;
    };
  };
};

// Recursive type to get all possible nested paths
type DotNotation<T extends object> = {
  [K in keyof T & (string | number)]: T[K] extends object
  ? `${K}.${DotNotation<T[K]>}` | K
  : K
}[keyof T & (string | number)];

type StampField = {
  path: DotNotation<FormValuesProps>;  // nested path to the form value
  page: number;                        // 1-based
  x: number;                          // percent (0..1) or absolute x (points)
  y: number;                          // percent (0..1) or absolute y (top-origin points)
  widthPct?: number;                  // optional max width in percent (wrap/shrink)
  fontSize?: number;                  // default 12
  color?: { r: number; g: number; b: number }; // default black
};

/** Draw one line of text at percent-based position (top-left space). */
function drawStamp(opts: {
  page: any;
  text: string;
  pageWidth: number;
  pageHeight: number;
  x: number; // percent (0..1) or absolute
  y: number; // percent (0..1 - from top) or absolute (top-origin)
  widthPct?: number;
  font: any;
  fontSize: number;
  color: { r: number; g: number; b: number };
}) {
  const {
    page, text, pageWidth, x, y, widthPct, font, fontSize, color
  } = opts;

  let size = fontSize;
  const maxWidth = widthPct ? widthPct * pageWidth : undefined;

  // simple shrink-to-fit if maxWidth provided
  if (maxWidth) {
    const width = font.widthOfTextAtSize(text, size);
    if (width > maxWidth) {
      const ratio = maxWidth / Math.max(1, width);
      size = Math.max(7, Math.floor(size * ratio)); // clamp min size
    }
  }

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: rgb(color.r, color.g, color.b),
    maxWidth,
  });
}

/** Get a value from an object using a dot-notation path */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/** Fill the template by stamping text values at predefined positions. */
async function fillPdfTemplate(
  templateUrl: string,
  stamps: StampField[],
  values: FormValuesProps
): Promise<Blob> {
  const bytes = await fetch(templateUrl, { cache: 'no-store' }).then(r => r.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);

  stamps.forEach((s) => {
    const value = getNestedValue(values, s.path);
    // Convert value to display text
    let text: string;
    if (typeof value === 'boolean') {
      text = value ? 'X' : ' ';
    } else {
      text = (value ?? '').toString();
    }
    if (!text) return;

    const page = pdf.getPage(s.page - 1);
    const W = page.getWidth();
    const H = page.getHeight();

    drawStamp({
      page,
      text,
      pageWidth: W,
      pageHeight: H,
      x: s.x,
      y: s.y,
      widthPct: s.widthPct,
      font: helv,
      fontSize: s.fontSize ?? 12,
      color: s.color ?? { r: 0, g: 0, b: 0 },
    });
  });

  const out = await pdf.save();
  // Ensure we create a Blob from a plain ArrayBuffer (not a SharedArrayBuffer or other ArrayBufferLike)
  const uint8 = Uint8Array.from(out);
  return new Blob([uint8.buffer], { type: 'application/pdf' });
}


export default function EditPaintShopPdfDialog({
  title,
  content,
  fileUrl,
  open,
  onClose,
  onSaveFile,
  ...other
}: ConfirmDialogProps) {
  const { t } = useTranslate();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [previewUrl, setPreviewUrl] = useState(fileUrl);
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  // Put this in your component file (outside the component fn):
  const TEMPLATE_URL =
    'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FLacker_PDF.pdf?alt=media&token=4d0f57e6-2e90-4f68-9a9f-b626545c0852';

  const STAMPS: StampField[] = [
    // Client info (workshop)
    { path: 'parties.client.company', page: 1, x: 205, y: 612, fontSize: 10 },
    { path: 'parties.client.contactPerson', page: 1, x: 125, y: 595, fontSize: 10 },
    { path: 'parties.client.phone', page: 1, x: 82, y: 582, fontSize: 10 },
    { path: 'parties.client.email', page: 1, x: 80, y: 563, fontSize: 10 },
    { path: 'parties.client.address', page: 1, x: 87, y: 548, fontSize: 10 },

    // Contractor info (adviser/service provider)
    { path: 'parties.contractor.company', page: 1, x: 235, y: 531, fontSize: 10 },
    { path: 'parties.contractor.contactPerson', page: 1, x: 125, y: 514, fontSize: 10 },
    { path: 'parties.contractor.phone', page: 1, x: 82, y: 498, fontSize: 10 },
    { path: 'parties.contractor.email', page: 1, x: 80, y: 485, fontSize: 10 },
    { path: 'parties.contractor.address', page: 1, x: 87, y: 465, fontSize: 10 },

    // Vehicle info
    { path: 'vehicle.makeModel', page: 1, x: 110, y: 430, fontSize: 10 },
    { path: 'vehicle.vin', page: 1, x: 85, y: 415, fontSize: 10 },
    { path: 'vehicle.licensePlate', page: 1, x: 128, y: 397, fontSize: 10 },
    { path: 'vehicle.paintCode', page: 1, x: 120, y: 382, fontSize: 10 },
    { path: 'vehicle.mileageKm', page: 1, x: 130, y: 365, fontSize: 10 },

    // Scope of work
    { path: 'scope.partialPainting.selected', page: 1, x: 42, y: 328, fontSize: 10 },
    { path: 'scope.partialPainting.components', page: 1, x: 180, y: 330, fontSize: 10 },
    { path: 'scope.fullPainting', page: 1, x: 42, y: 302, fontSize: 10 },
    { path: 'scope.blendAdjacentParts', page: 1, x: 42, y: 276, fontSize: 10 },
    { path: 'scope.surfacePrep', page: 1, x: 42, y: 248, fontSize: 10 },
    { path: 'scope.dismantleReassemble.selected', page: 1, x: 42, y: 225, fontSize: 10 },
    { path: 'scope.dismantleReassemble.notes', page: 1, x: 245, y: 225, fontSize: 10 },
    { path: 'scope.plasticOrAluminumRepair', page: 1, x: 42, y: 198, fontSize: 10 },
    { path: 'scope.corrosionProtection', page: 1, x: 42, y: 172, fontSize: 10 },
    { path: 'scope.paintFinishPolish', page: 1, x: 42, y: 144, fontSize: 10 },
    // Documentation
    { path: 'documentation.preExistingDamage', page: 2, x: 40, y: 720, fontSize: 10 },
    { path: 'documentation.photoDocumentationByContractor', page: 2, x: 256, y: 665, fontSize: 10 },
    { path: 'documentation.photoDocumentationByContractor', page: 2, x: 285, y: 665, fontSize: 10 },
    // Deadlines
    { path: 'deadlines.deliveryAt', page: 2, x: 200, y: 626, fontSize: 10 },
    { path: 'deadlines.estimatedCompletionAt', page: 2, x: 273, y: 610, fontSize: 10 },
    { path: 'deadlines.pickupByDate', page: 2, x: 148, y: 593, fontSize: 10 },
    // Price approval
    { path: 'priceApproval.appraisalRef', page: 2, x: 166, y: 555, fontSize: 10 },
    { path: 'priceApproval.appraisalSystem', page: 2, x: 267, y: 540, fontSize: 10 },
    { path: 'priceApproval.totalNetEUR', page: 2, x: 240, y: 525, fontSize: 10 },
    { path: 'priceApproval.vatEUR', page: 2, x: 163, y: 508, fontSize: 10 },
    { path: 'priceApproval.termsDays', page: 2, x: 208, y: 452, fontSize: 10 },
    // Parts disposal
    { path: 'partsDisposal.oldPartsDisposed', page: 2, x: 42, y: 129, fontSize: 10 },
    { path: 'partsDisposal.oldPartsReturned', page: 3, x: 42, y: 755, fontSize: 10 }, // Or x=285
    { path: 'partsDisposal.disposalCosts.includedInInvoice', page: 3, x: 318, y: 728, fontSize: 10 },
    { path: 'partsDisposal.disposalCosts.listedSeparately', page: 3, x: 380, y: 728, fontSize: 10 },

  ];
  // ^ Adjust percentages to match the actual boxes/lines on your PDF.
  // Tip: set a crazy color (e.g., {r:1,g:0,b:0}) during calibration to see placement.


  const PaintShopSchema: Yup.ObjectSchema<FormValuesProps> = Yup.object().shape({
    parties: Yup.object().shape({
      client: Yup.object().shape({
        company: Yup.string().default(''),
        contactPerson: Yup.string(),
        phone: Yup.string(),
        email: Yup.string().email(t('email_is_not_valid')),
        address: Yup.string()
      }),
      contractor: Yup.object().shape({
        company: Yup.string().default(''),
        contactPerson: Yup.string().default(''),
        phone: Yup.string().default(''),
        email: Yup.string().email(t('email_is_not_valid')).default(''),
        address: Yup.string().default('')
      })
    }),
    vehicle: Yup.object().shape({
      makeModel: Yup.string().default(''),
      vin: Yup.string().default(''),
      licensePlate: Yup.string().default(''),
      paintCode: Yup.string().default(''),
      mileageKm: Yup.number().integer().min(0).nullable().default(null)
    }),
    scope: Yup.object().shape({
      partialPainting: Yup.object().shape({
        selected: Yup.boolean().default(false),
        components: Yup.string().default('')
      }),
      fullPainting: Yup.boolean().default(false),
      blendAdjacentParts: Yup.boolean().default(false),
      surfacePrep: Yup.boolean().default(false),
      dismantleReassemble: Yup.object().shape({
        selected: Yup.boolean().default(false),
        notes: Yup.string()
      }),
      plasticOrAluminumRepair: Yup.boolean().default(false),
      corrosionProtection: Yup.boolean().default(false),
      paintFinishPolish: Yup.boolean().default(false)
    }),
    documentation: Yup.object().shape({
      preExistingDamage: Yup.string().default(''),
      photoDocumentationByContractor: Yup.boolean().nullable().default(null)
    }),
    deadlines: Yup.object().shape({
      deliveryAt: Yup.date().nullable().default(null),
      estimatedCompletionAt: Yup.date().nullable().default(null),
      pickupByDate: Yup.date().nullable().default(null),
    }),
    priceApproval: Yup.object().shape({
      appraisalRef: Yup.string().default(''),
      appraisalSystem: Yup.string().default(''),
      totalNetEUR: Yup.number().min(0).nullable().default(null),
      vatEUR: Yup.number().min(0).nullable().default(null),
      termsDays: Yup.string().nullable().default(''),
    }),
    partsDisposal: Yup.object().shape({
      oldPartsDisposed: Yup.boolean().nullable().default(null),
      oldPartsReturned: Yup.boolean().nullable().default(null),
      disposalCosts: Yup.object().shape({
        includedInInvoice: Yup.boolean().nullable().default(null),
        listedSeparately: Yup.boolean().nullable().default(null)
      })
    })
  });

  const defaultValues = useMemo(
    () => ({
      parties: {
        client: {
          company: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: ''
        },
        contractor: {
          company: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: ''
        }
      },
      vehicle: {
        makeModel: '',
        vin: '',
        licensePlate: '',
        paintCode: '',
        mileageKm: null
      },
      scope: {
        partialPainting: {
          selected: false,
          components: ''
        },
        fullPainting: false,
        blendAdjacentParts: false,
        surfacePrep: false,
        dismantleReassemble: {
          selected: false,
          notes: ''
        },
        plasticOrAluminumRepair: false,
        corrosionProtection: false,
        paintFinishPolish: false
      },
      documentation: {
        preExistingDamage: "",
        photoDocumentationByContractor: null
      },
      deadlines: {
        deliveryAt: null,
        estimatedCompletionAt: null,
        pickupByDate: null
      },
      priceApproval: {
        totalNetEUR: null,
        vatEUR: null,
        termsDays: null,
        appraisalRef: '',
        appraisalSystem: ''
      },
      partsDisposal: {
        oldPartsDisposed: null,
        oldPartsReturned: null,
        disposalCosts: {
          includedInInvoice: null,
          listedSeparately: null
        }
      }
    }),
    []
  );
  // const defaultValues = useMemo(
  //   () => ({
  //     parties: {
  //       client: {
  //         company: 'Workshop GmbH',
  //         contactPerson: 'Müller',
  //         phone: '+49 123 4567890',
  //         email: 'musterfrau@workshop-gmbh.de',
  //         address: 'Musterstraße 1, 12345 Musterstadt'
  //       },
  //       contractor: {
  //         company: 'Service AG',
  //         contactPerson: 'Thomas Beispiel',
  //         phone: '+49 987 6543210',
  //         email: 'thomas.beispiel@service-ag.de',
  //         address: 'Beispielstraße 2, 54321 Beispielstadt'
  //       }
  //     },
  //     vehicle: {
  //       makeModel: 'Mercedes-Benz C-Klasse',
  //       vin: 'FGH1234567890ABCDE',
  //       licensePlate: 'BL-AB 1234',
  //       paintCode: '987XYZ',
  //       mileageKm: null
  //     },
  //     scope: {
  //       partialPainting: {
  //         selected: true,
  //         components: 'Paint left door and rear fender'
  //       },
  //       fullPainting: true,
  //       blendAdjacentParts: true,
  //       surfacePrep: true,
  //       dismantleReassemble: {
  //         selected: true,
  //         notes: 'Dismantle and reassemble rear bumper'
  //       },
  //       plasticOrAluminumRepair: true,
  //       corrosionProtection: true,
  //       paintFinishPolish: true
  //     },
  //     documentation: {
  //       preExistingDamage: "Already existing scratch on right door.",
  //       photoDocumentationByContractor: null
  //     },
  //     deadlines: {
  //       deliveryAt: null,
  //       estimatedCompletionAt: null,
  //       pickupByDate: null
  //     },
  //     priceApproval: {
  //       totalNetEUR: null,
  //       vatEUR: null,
  //       termsDays: null,
  //       appraisalRef: 'APP-123456',
  //       appraisalSystem: 'AutoExpert'
  //     },
  //     partsDisposal: {
  //       oldPartsDisposed: true,
  //       oldPartsReturned: true,
  //       disposalCosts: {
  //         includedInInvoice: false,
  //         listedSeparately: true
  //       }
  //     }
  //   }),
  //   []
  // );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(PaintShopSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormSubmit = async (data: FormValuesProps) => {
    try {
      // 1) Fill the template
      const blob = await fillPdfTemplate(TEMPLATE_URL, STAMPS, data);

      // 2) Preview it
      // Revoke old URL to avoid memory leaks
      setPreviewUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });

      // return false; // prevent parent form submission
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = handleSubmit(handleFormSubmit);

  const handleClose = () => {
    // Revoke preview URL to avoid memory leaks
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return undefined;
    });
    reset();
    onClose();
    setActiveStep(0);
  };

  const handleSave = handleSubmit(async (data) => {
    try {
      // 1) Fill the template
      console.log('Preview URL on save:', previewUrl);

      // Return blob to parent
      if (previewUrl) {
        onSaveFile?.(previewUrl);
      }

      // Close dialog after save
      // setPreviewUrl((prev) => {
      //   if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      //   return undefined;
      // });
      reset();
      setActiveStep(0);
    } catch (error) {
      console.error(error);
    }
  });

  const steps = [
    t('parties'),
    t('vehicle'),
    t('scope'),
    t('documentation'),
    t('deadlines'),
    t('price_approval'),
    t('parts_disposal'),
    t('preview')
  ];

  return (
    <Dialog fullWidth maxWidth="xl" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">{title}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            {t('back')}
          </Button>
          <Button
            variant={activeStep === steps.length - 1 ? 'contained' : 'text'}
            onClick={activeStep === steps.length - 1 ? onSubmit : handleNext}
            endIcon={<Iconify icon={activeStep === steps.length - 1 ? 'eva:checkmark-fill' : 'eva:arrow-ios-forward-fill'} />}
          >
            {activeStep === steps.length - 1 ? t('finish') : t('next')}
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ height: '80vh', minHeight: 600 }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3} sx={{ height: '100%', overflow: 'auto' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Parties */}
            {activeStep === 0 && (
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h6">{t('client_info')}</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.client.company" label={t('company')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.client.contactPerson" label={t('contact_person')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.client.phone" label={t('phone')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.client.email" label={t('email')} />
                      </Grid>
                      <Grid item xs={12}>
                        <RHFTextField name="parties.client.address" label={t('address')} />
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 3 }}>{t('contractor_info')}</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.contractor.company" label={t('company')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.contractor.contactPerson" label={t('contact_person')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.contractor.phone" label={t('phone')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <RHFTextField name="parties.contractor.email" label={t('email')} />
                      </Grid>
                      <Grid item xs={12}>
                        <RHFTextField name="parties.contractor.address" label={t('address')} />
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Vehicle */}
            {activeStep === 1 && (
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="vehicle.makeModel" label={t('vehicle_model')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="vehicle.vin" label={t('vin')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="vehicle.licensePlate" label={t('license_plate')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="vehicle.paintCode" label={t('paint_code')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="vehicle.mileageKm" label={t('mileage_km')} type="number" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Scope */}
            {activeStep === 2 && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <RHFCheckbox name="scope.partialPainting.selected" label={t('partial_painting')} />
                    {methods.watch('scope.partialPainting.selected') && (
                      <RHFTextField name="scope.partialPainting.components" label={t('notes')} multiline rows={3} />
                    )}
                    <RHFCheckbox name="scope.fullPainting" label={t('full_painting')} />
                    <RHFCheckbox name="scope.blendAdjacentParts" label={t('blend_adjacent_parts')} />
                    <RHFCheckbox name="scope.surfacePrep" label={t('surface_preparation')} />
                    <RHFCheckbox name="scope.dismantleReassemble.selected" label={t('dismantle_reassemble')} />
                    {methods.watch('scope.dismantleReassemble.selected') && (
                      <RHFTextField name="scope.dismantleReassemble.notes" label={t('notes')} multiline rows={3} />
                    )}
                    <RHFCheckbox name="scope.plasticOrAluminumRepair" label={t('plastic_aluminum_repair')} />
                    <RHFCheckbox name="scope.corrosionProtection" label={t('corrosion_protection')} />
                    <RHFCheckbox name="scope.paintFinishPolish" label={t('paint_finish_polish')} />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Documentation */}
            {activeStep === 3 && (
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <RHFTextField name="documentation.preExistingDamage" label={t('pre_existing_damage')} multiline rows={4} />
                    <RHFCheckbox name="documentation.photoDocumentationByContractor" label={t('photo_documentation_by_contractor')} />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Deadlines */}
            {activeStep === 4 && (
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <CustomDatePicker fieldName="deadlines.deliveryAt" title={t('delivery_at')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomDatePicker fieldName="deadlines.estimatedCompletionAt" title={t('estimated_completion_at')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomDatePicker fieldName="deadlines.pickupByDate" title={t('pickup_by_date')} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Price Approval */}
            {activeStep === 5 && (
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="priceApproval.appraisalRef" label={t('appraisal_ref')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="priceApproval.appraisalSystem" label={t('appraisal_system')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="priceApproval.totalNetEUR" label={t('total_net_eur')} type="number" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="priceApproval.vatEUR" label={t('vat_eur')} type="number" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="priceApproval.termsDays" label={t('payment_terms_days')} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Parts Disposal */}
            {activeStep === 6 && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <RHFCheckbox name="partsDisposal.oldPartsDisposed" label={t('old_parts_disposed')} />
                    <RHFCheckbox name="partsDisposal.oldPartsReturned" label={t('old_parts_returned')} />
                    <Typography variant="subtitle1">{t('disposal_costs')}</Typography>
                    <RHFCheckbox name="partsDisposal.disposalCosts.includedInInvoice" label={t('included_in_invoice')} />
                    <RHFCheckbox name="partsDisposal.disposalCosts.listedSeparately" label={t('listed_separately')} />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Step 8: Preview */}
            {activeStep === 7 && (
              <Card sx={{
                height: 'calc(100% - 80px)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{
                  height: '100%',
                  p: '0 !important',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}>
                  {previewUrl && previewUrl !== '' ? (
                    <Viewer
                      theme={{
                        theme: 'dark',
                      }}
                      plugins={[
                        defaultLayoutPluginInstance,
                      ]}
                      defaultScale={SpecialZoomLevel.PageFit}
                      fileUrl={previewUrl || 'NO_DATA'} />
                  ) : (
                    <Box sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '400px' // Ensure minimum height for the message container
                    }}>
                      <Typography variant="body1" align="center">
                        {t('generate_preview_by_clicking_finish_button_at_top')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Stack>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSubmitting || !previewUrl}
        >
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
