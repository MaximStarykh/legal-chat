interface HeaderProps {
  title?: string;
  description?: string;
}

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <div className="mb-6">
      {title && <h1 className="text-xl font-medium text-gray-900 mb-1">{title}</h1>}
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
};
