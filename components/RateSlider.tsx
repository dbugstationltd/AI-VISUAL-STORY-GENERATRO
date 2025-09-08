import React from 'react';

interface RateSliderProps {
  rate: number;
  onRateChange: (rate: number) => void;
  disabled: boolean;
}

export const RateSlider: React.FC<RateSliderProps> = ({
  rate,
  onRateChange,
  disabled,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRateChange(parseFloat(event.target.value));
  };

  return (
    <div className="w-full max-w-lg mt-4">
      <label htmlFor="rate-slider" className="block text-sm font-medium text-slate-400 mb-2 text-center sm:text-left">
        Narration Speed
      </label>
      <div className="flex items-center gap-4">
        <input
          id="rate-slider"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-400"
          aria-label="Adjust narration speed"
        />
        <span className="text-sm font-medium text-slate-300 w-10 text-center">{rate.toFixed(1)}x</span>
      </div>
    </div>
  );
};