import logoImg from "../../imports/Plan_de_travail72.png";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <img
      src={logoImg}
      alt="Adokèh"
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size * 2, height: size * 2 }}
    />
  );
}
