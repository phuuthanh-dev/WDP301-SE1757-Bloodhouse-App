import React from "react";
import * as PhosphorIcons from "phosphor-react-native";

const DynamicIcon = ({ icon }) => {
  if (!icon || typeof icon !== "object") {
    console.warn("Invalid icon prop passed to DynamicIcon.");
    return null;
  }

  const { name, color = "#000", size = 24 } = icon;
  const IconComponent = PhosphorIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in phosphor-react-native.`);
    return null;
  }

  return <IconComponent size={size} color={color} />;
};

export default DynamicIcon;
