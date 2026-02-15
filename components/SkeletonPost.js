import { View } from 'react-native';

function Bone({ className = '' }) {
    return <View className={`bg-slate-700/60 rounded-lg ${className}`} />;
}

export function SkeletonPost() {
    return (
        <View className="mb-3 mx-4 bg-slate-800/90 rounded-2xl overflow-hidden border border-slate-700/40 p-4">
            {/* Header skeleton */}
            <View className="flex-row items-center gap-3 mb-4">
                <Bone className="w-10 h-10 rounded-full" />
                <View className="flex-1 gap-2">
                    <Bone className="w-32 h-3" />
                    <Bone className="w-20 h-2.5" />
                </View>
            </View>
            {/* Title */}
            <Bone className="w-40 h-4 mb-4" />
            {/* Image placeholder */}
            <Bone className="w-full h-48 rounded-xl mb-4" />
            {/* Impact pills */}
            <View className="flex-row gap-2 mb-4">
                <Bone className="w-20 h-7 rounded-full" />
                <Bone className="w-16 h-7 rounded-full" />
                <Bone className="w-24 h-7 rounded-full" />
            </View>
            {/* Caption */}
            <View className="gap-2 mb-4">
                <Bone className="w-full h-3" />
                <Bone className="w-3/4 h-3" />
            </View>
            {/* Footer */}
            <View className="flex-row gap-6 pt-3 border-t border-slate-700/30">
                <Bone className="w-12 h-5 rounded" />
                <Bone className="w-12 h-5 rounded" />
                <Bone className="w-8 h-5 rounded" />
            </View>
        </View>
    );
}

export function SkeletonFeed() {
    return (
        <View className="pt-4">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
        </View>
    );
}
