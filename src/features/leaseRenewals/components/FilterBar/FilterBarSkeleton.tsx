import React from 'react';
import { Skeleton } from '../../../../components/ui/Skeleton';

export const FilterBarSkeleton: React.FC = () => {
    return (
        <div className="bg-white border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <Skeleton width="280px" height="36px" rounded="md" />
                <Skeleton width="120px" height="36px" rounded="md" />
                <Skeleton width="120px" height="36px" rounded="md" />
                <Skeleton width="100px" height="36px" rounded="md" />
                <Skeleton width="110px" height="36px" rounded="md" />

                <div className="ml-auto flex gap-3">
                    <Skeleton width="90px" height="16px" rounded="sm" />
                    <Skeleton width="70px" height="16px" rounded="sm" />
                </div>
            </div>

            <div className="flex px-4 py-2 justify-between border-t border-gray-50">
                <Skeleton width="160px" height="16px" rounded="sm" />
                <Skeleton width="100px" height="16px" rounded="sm" />
            </div>
        </div>
    );
};
