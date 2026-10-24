import {
  timelineOptions,
  type InquiryErrors,
  type ProjectDetails,
} from "../estimator/inquiry";

export const estimatorInputClass =
  "min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50";

export function EstimatorTextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  error,
  multiline = false,
  required = false,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
  multiline?: boolean;
  required?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
}): React.ReactNode {
  const props = {
    id,
    value,
    maxLength,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    className: estimatorInputClass,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {multiline ? (
        <textarea {...props} rows={3} />
      ) : (
        <input {...props} type={type} autoComplete={autoComplete} />
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function EstimatorDetails({
  details,
  onChange,
  errors,
  prefix,
}: {
  details: ProjectDetails;
  onChange: (details: ProjectDetails) => void;
  errors: InquiryErrors;
  prefix: string;
}): React.ReactNode {
  const field = (
    key: keyof ProjectDetails,
    label: string,
    maxLength: number,
    options: {
      multiline?: boolean;
      required?: boolean;
      type?: "text" | "email";
      autoComplete?: string;
    } = {},
  ) => (
    <EstimatorTextField
      id={`${prefix}-${key}`}
      label={label}
      value={details[key]}
      maxLength={maxLength}
      error={errors[key]}
      onChange={(value) => onChange({ ...details, [key]: value })}
      {...options}
    />
  );
  return (
    <section aria-labelledby={`${prefix}-details`} className="space-y-4">
      <div>
        <h3 id={`${prefix}-details`} className="text-lg font-semibold">
          Project details
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore prices first. Complete required fields (*) when you are ready
          to email your inquiry.
        </p>
      </div>
      {field("projectName", "Project name", 100, { required: true })}
      {field("description", "Describe your project", 2000, {
        multiline: true,
        required: true,
      })}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`${prefix}-timeline`}
            className="block text-sm font-medium"
          >
            Preferred timeline
          </label>
          <select
            id={`${prefix}-timeline`}
            className={estimatorInputClass}
            value={details.timeline}
            onChange={(event) =>
              onChange({
                ...details,
                timeline: event.target.value as ProjectDetails["timeline"],
              })
            }
          >
            {timelineOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        {field("company", "Company (optional)", 100, {
          autoComplete: "organization",
        })}
        {field("name", "Your name", 100, {
          required: true,
          autoComplete: "name",
        })}
        {field("email", "Email address", 254, {
          required: true,
          type: "email",
          autoComplete: "email",
        })}
      </div>
    </section>
  );
}
