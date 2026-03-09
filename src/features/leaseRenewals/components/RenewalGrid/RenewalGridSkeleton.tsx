import React from 'react';
import { Skeleton } from '../../../../components/ui/Skeleton';

interface RenewalGridSkeletonProps {
    rows?: number;
}

export const RenewalGridSkeleton: React.FC<RenewalGridSkeletonProps> = ({ rows = 8 }) => {
    return (
        <div className="overflow-auto">
            <table className="w-full min-w-[1200px] text-sm border-collapse">
                <thead>
                    <tr className="border-y border-gray-200 bg-gray-50/80">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <th key={i} className="py-3 px-3">
                                <Skeleton height="12px" width={`${60 + (i % 3) * 20}px`} className="inline-block" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <tr
                            key={index}
                            className="border-b border-gray-100 divide-y-0 bg-white"
                        >
                            <td className="py-2.5 px-3">
                                <Skeleton width="16px" height="16px" rounded="sm" className="mx-auto" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="140px" height="14px" className="mb-1.5" style={{ animationDelay: `${index * 50}ms` }} />
                                <Skeleton width="90px" height="12px" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="110px" height="14px" className="mb-1.5" style={{ animationDelay: `${index * 50}ms` }} />
                                <Skeleton width="130px" height="12px" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="60px" height="14px" className="ml-auto" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3 bg-green-50/30">
                                <Skeleton width="60px" height="14px" className="ml-auto !bg-green-100" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="40px" height="12px" className="ml-auto" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="80px" height="14px" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="90px" height="14px" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="90px" height="20px" rounded="full" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="110px" height="20px" rounded="full" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="100px" height="14px" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                            <td className="py-2.5 px-3">
                                <Skeleton width="16px" height="16px" rounded="sm" className="mx-auto" style={{ animationDelay: `${index * 50}ms` }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
