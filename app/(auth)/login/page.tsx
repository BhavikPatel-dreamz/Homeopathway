import LoginForm from '../../../components/LoginForm';

export const metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="p-8">
      <LoginForm />
    </main>
  );
}
