interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-green-600 text-white py-4 px-4">
      <h2 className="text-center text-lg font-semibold">{title}</h2>
    </div>
  );
}

