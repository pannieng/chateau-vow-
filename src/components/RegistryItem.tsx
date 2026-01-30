import React from 'react';
import { motion } from 'framer-motion';

interface RegistryItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  label: string;
  description: string;
  compact?: boolean;
}

const RegistryItem = ({
  icon: Icon,
  title,
  label,
  description,
  
}: RegistryItemProps) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className="registry-item"
  >
    <div className="registry-icon">
      <Icon size={18} className="text-[#ff6b93]" />
    </div>
    <div>
      <div className="registry-kicker">{title}</div>
      <div className="registry-label">{label}</div>
      <div className="registry-desc">{description}</div>
    </div>
  </motion.div>
);

export default RegistryItem;