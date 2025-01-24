import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { value: "overview", label: "Overview" },
    { value: "water", label: "Water Management" },
    { value: "crops", label: "Crops" },
    { value: "cropplan", label: "Crop Plan" },
    { value: "issues", label: "Tasks/Issues" },
    { value: "reports", label: "Reports" },
    { value: "history", label: "History" },
    { value: "instructions", label: "Instructions" }
  ];

  return (
    <div className="block md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {menuItems.map((item) => (
            <DropdownMenuItem 
              key={item.value}
              className={`cursor-pointer ${activeTab === item.value ? 'bg-gray-100' : ''}`}
              onClick={() => setActiveTab(item.value)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;
