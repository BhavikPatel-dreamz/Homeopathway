import EditRemedyForm from '../../../../../../components/EditRemedyForm';

export const metadata = {
  title: 'Edit Remedy - Admin Dashboard',
};

interface EditRemedyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRemedyPage({ params }: EditRemedyPageProps) {
  const { id } = await params;
  return <EditRemedyForm remedyId={id} />;
}

