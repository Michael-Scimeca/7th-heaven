import React from "react";

export function CheckMarkIcon({ className = "w-3.5 h-3.5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
 id="Layer_1"
 xmlns="http://www.w3.org/2000/svg"
 version="1.1"
 viewBox="0 0 336.92 327.78"
 fill="currentColor"
 className={className}
 aria-hidden="true"
 {...props}
 >
      <path d="M7.7,206.4c-11.83-14.41-9.5-35.03,3.35-47.18,12.73-12.03,33.25-13.28,46.81-1.01l63.21,57.2c3.29,2.97,8.34,2.13,11.17-1.06L318.68,4.11c3.55-4,8.06-5.28,12.59-2.95,3.81,1.95,7.5,8,4.63,12.61l-186.45,299.33c-10.68,17.14-37.67,20.07-50.42,4.53L7.7,206.4Z" />
    </svg>
  );
}

export default CheckMarkIcon;
