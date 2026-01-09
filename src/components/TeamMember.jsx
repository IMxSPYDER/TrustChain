import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram } from "lucide-react";

const TeamMember = ({ image, name, position, bio }) => {
  return (
    <div className="group">
      <div className="relative h-[240px] mb-4 overflow-hidden rounded-lg">
        <img src={image || "/placeholder.svg"} alt={name} className="object-cover w-full h-full" />
      </div>
      <div className="space-y-2">
        <p className="text-[#5d9eff] text-xs font-medium tracking-wider uppercase">{position}</p>
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-gray-300 text-sm">{bio}</p>
        <div className="flex items-center gap-3 pt-2">
          <Link to="#" className="text-gray-400 hover:text-white transition-colors">
            <Facebook className="w-4 h-4" />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white transition-colors">
            <Twitter className="w-4 h-4" />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white transition-colors">
            <Instagram className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamMember;
