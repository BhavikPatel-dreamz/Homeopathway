import EditUserForm from '../../../../../components/EditUserForm';

export const metadata = {
  title: 'Edit User - Admin Dashboard',
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  return <EditUserForm userId={id} />;
}
