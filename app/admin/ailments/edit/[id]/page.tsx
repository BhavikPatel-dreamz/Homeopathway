import EditAilmentForm from '../../../../../components/EditAilmentFormWithRemedies';

export const metadata = {
  title: 'Edit Ailment - Admin Dashboard',
};

interface EditAilmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAilmentPage({ params }: EditAilmentPageProps) {
  const { id } = await params;
  return <EditAilmentForm ailmentId={id} />;
}

