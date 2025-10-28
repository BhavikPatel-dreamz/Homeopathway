import RegisterForm from '../../../components/RegisterForm';

export const metadata = {
  title: 'Register',
};

export default function RegisterPage() {
  return (
    <main className="p-8">
      <RegisterForm />
    </main>
  );
}
