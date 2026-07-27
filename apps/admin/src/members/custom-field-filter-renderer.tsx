import React from 'react';
import {Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@tryghost/shade/components';
import {useBrowseMemberCustomFields} from '@tryghost/admin-x-framework/api/member-custom-fields';
import type {CustomRendererProps} from '@tryghost/shade/patterns';

// One "Custom field" filter stands in for every defined field, so the value area
// is a small cascade: which field, then (for an address) which sub-field, then the
// value. The predicate carries all three as [fieldKey, subfield, value] — the
// shape member-fields.ts serialises to the compound NQL.
const ADDRESS_SUBFIELDS: Array<{value: string; label: string}> = [
    {value: 'line1', label: 'Address line 1'},
    {value: 'line2', label: 'Address line 2'},
    {value: 'city', label: 'City'},
    {value: 'state', label: 'State'},
    {value: 'postal_code', label: 'Postal code'},
    {value: 'country', label: 'Country'}
];

const VALUELESS_OPERATORS = new Set(['is-set', 'is-not-set']);

const CustomFieldFilterRenderer: React.FC<CustomRendererProps<string>> = ({values, onChange, operator}) => {
    const {data} = useBrowseMemberCustomFields();
    const fields = data?.members_custom_fields ?? [];

    const [fieldKey = '', subfield = '', value = ''] = values;
    const selectedField = fields.find(field => field.key === fieldKey);
    const isAddress = selectedField?.type === 'address';
    const needsValue = !VALUELESS_OPERATORS.has(operator);

    const handleFieldChange = (nextKey: string) => {
        const nextField = fields.find(field => field.key === nextKey);
        // Default an address to its first sub-field so the value always targets a
        // real JSON path rather than the scalar column it doesn't use.
        const nextSubfield = nextField?.type === 'address' ? ADDRESS_SUBFIELDS[0].value : '';
        onChange([nextKey, nextSubfield, '']);
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={fieldKey} onValueChange={handleFieldChange}>
                <SelectTrigger className="h-8 w-auto min-w-32 text-sm" data-testid="custom-field-filter-field">
                    <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                    {fields.map(field => (
                        <SelectItem key={field.key} value={field.key}>{field.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isAddress && needsValue && (
                <Select value={subfield} onValueChange={nextSubfield => onChange([fieldKey, nextSubfield, value])}>
                    <SelectTrigger className="h-8 w-auto min-w-28 text-sm" data-testid="custom-field-filter-subfield">
                        <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                        {ADDRESS_SUBFIELDS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {needsValue && (
                <Input
                    className="h-8 w-40 text-sm"
                    data-testid="custom-field-filter-value"
                    placeholder="Enter value..."
                    value={value}
                    onChange={event => onChange([fieldKey, subfield, event.target.value])}
                />
            )}
        </div>
    );
};

export default CustomFieldFilterRenderer;
