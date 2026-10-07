import React from 'react';
import {
  Calculator,
  Atom,
  Scale,
  Code,
  FlaskConical,
  Brain,
  BookOpen,
  Compass,
  Globe,
  Music,
  Sparkles,
  Cpu,
  GraduationCap,
  LucideProps,
} from 'lucide-react';

interface SubjectIconProps extends LucideProps {
  name?: string;
  fallbackText?: string;
}

export const SUBJECT_ICON_OPTIONS = [
  { id: 'Calculator', label: 'Calculator', icon: Calculator },
  { id: 'Atom', label: 'Physics / Atom', icon: Atom },
  { id: 'Scale', label: 'Law / Ethics', icon: Scale },
  { id: 'Code', label: 'Code / Systems', icon: Code },
  { id: 'FlaskConical', label: 'Chemistry / Lab', icon: FlaskConical },
  { id: 'Brain', label: 'Neuro / Mind', icon: Brain },
  { id: 'BookOpen', label: 'Literature / Books', icon: BookOpen },
  { id: 'Compass', label: 'Design / Geometry', icon: Compass },
  { id: 'Globe', label: 'Languages / World', icon: Globe },
  { id: 'Music', label: 'Arts / Music', icon: Music },
  { id: 'Cpu', label: 'Hardware / Robotics', icon: Cpu },
  { id: 'GraduationCap', label: 'Academia', icon: GraduationCap },
];

export const SubjectIcon: React.FC<SubjectIconProps> = ({
  name,
  fallbackText,
  className = 'w-5 h-5',
  ...props
}) => {
  switch (name) {
    case 'Calculator':
      return <Calculator className={className} {...props} />;
    case 'Atom':
      return <Atom className={className} {...props} />;
    case 'Scale':
      return <Scale className={className} {...props} />;
    case 'Code':
      return <Code className={className} {...props} />;
    case 'FlaskConical':
      return <FlaskConical className={className} {...props} />;
    case 'Brain':
      return <Brain className={className} {...props} />;
    case 'BookOpen':
      return <BookOpen className={className} {...props} />;
    case 'Compass':
      return <Compass className={className} {...props} />;
    case 'Globe':
      return <Globe className={className} {...props} />;
    case 'Music':
      return <Music className={className} {...props} />;
    case 'Cpu':
      return <Cpu className={className} {...props} />;
    case 'GraduationCap':
      return <GraduationCap className={className} {...props} />;
    default:
      if (fallbackText) {
        return (
          <span className="font-bold text-xs font-mono uppercase tracking-tight">
            {fallbackText.slice(0, 2)}
          </span>
        );
      }
      return <BookOpen className={className} {...props} />;
  }
};
