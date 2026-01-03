import { Helmet } from 'react-helmet-async';

import { EditPaintShopOrderView } from 'src/sections/main-app/damage';

// ----------------------------------------------------------------------

export default function EditPaintShopPDF() {
  return (
    <>
      <Helmet>
        <title> Edit PaintShop PDF </title>
      </Helmet>

      <EditPaintShopOrderView />
    </>
  );
}
