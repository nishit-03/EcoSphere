import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Dimensions } from 'react-native';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MapView, { Polyline, Marker, MapCircle } from '../../components/NativeMap';
import { BlurView } from 'expo-blur';
import { Route, Flame, ChevronDown, Zap, Navigation, MapPin, Leaf } from 'lucide-react-native';
import { useStore } from '../../utils/store';
import { impactAsync } from '../../utils/haptics';

const { width: SW } = Dimensions.get('window');

// ─── Region ───
const PUNE = { latitude: 18.5220, longitude: 73.8520, latitudeDelta: 0.022, longitudeDelta: 0.022 };

// ─── Route Colors (Blue = cycling, Green = walking) ───
const COLORS = { cycling: '#60a5fa', walking: '#4ade80', cleanup: '#fdba74', planting: '#86efac', public_transit: '#93c5fd' };

// ─── Periods ───
const PERIODS = ['today', 'week', 'month', 'all'];
const PERIOD_LABELS = { today: 'Today', week: '7 Days', month: '30 Days', all: 'All Time' };

// ─── Heatmap ───
function heatColor(w) {
    if (w >= 0.8) return 'rgba(153, 27, 27, 0.35)';
    if (w >= 0.6) return 'rgba(185, 28, 28, 0.28)';
    if (w >= 0.4) return 'rgba(217, 119, 6, 0.22)';
    if (w >= 0.2) return 'rgba(234, 179, 8, 0.16)';
    return 'rgba(250, 204, 21, 0.10)';
}
function heatR(w) { return 70 + w * 160; }

// ─── Bar chart ───
function WeekChart({ data }) {
    if (!data || !data.length) return null;
    const max = Math.max(...data, 0.1);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
        <View style={st.chartWrap}>
            <Text style={st.chartTitle}>Weekly CO₂ Saved (kg)</Text>
            <View style={st.chartBars}>
                {data.map((v, i) => (
                    <View key={i} style={st.chartCol}>
                        <View style={[st.chartBar, {
                            height: Math.max((v / max) * 32, 2),
                            backgroundColor: v === max ? '#60a5fa' : '#1e293b',
                        }]} />
                        <Text style={st.chartDay}>{days[i]}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Stat cell ───
function Stat({ label, value }) {
    return (
        <View style={st.halfItem}>
            <Text style={st.halfLabel}>{label}</Text>
            <Text style={st.halfValue}>{value}</Text>
        </View>
    );
}

// ═════════════════════════════════
// IMPACT MAP
// ═════════════════════════════════
export default function ImpactMap() {
    const mapRef = useRef(null);

    // Store
    const mapRoutes = useStore(s => s.mapRoutes);
    const heatmapData = useStore(s => s.heatmapData);
    const mapStats = useStore(s => s.mapStats);
    const viewMode = useStore(s => s.mapViewMode);
    const period = useStore(s => s.mapPeriod);
    const loading = useStore(s => s.mapLoading);
    const loadMapData = useStore(s => s.loadMapData);
    const setViewMode = useStore(s => s.setMapViewMode);
    const setPeriod = useStore(s => s.setMapPeriod);

    // Animations
    const welcomeOp = useRef(new Animated.Value(0)).current;
    const toggleSlide = useRef(new Animated.Value(0)).current;

    // Panel: 0=collapsed, 1=half, 2=full
    const [panelLvl, setPanelLvl] = useState(0);
    const panelAnim = useRef(new Animated.Value(0)).current;
    const [periodOpen, setPeriodOpen] = useState(false);

    // Init
    useEffect(() => { loadMapData(); }, []);

    // Camera + welcome
    useEffect(() => {
        if (mapRoutes.length > 0 && mapRef.current) {
            setTimeout(() => mapRef.current?.animateToRegion(PUNE, 1400), 300);
            setTimeout(() => {
                Animated.timing(welcomeOp, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
            }, 1500);
            setTimeout(() => {
                Animated.timing(welcomeOp, { toValue: 0, duration: 500, useNativeDriver: true }).start();
            }, 4200);
        }
    }, [mapRoutes]);

    // Toggle anim
    useEffect(() => {
        Animated.timing(toggleSlide, { toValue: viewMode === 'routes' ? 0 : 1, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
    }, [viewMode]);

    // Panel cycle
    const cyclePanel = useCallback(() => {
        impactAsync();
        const next = (panelLvl + 1) % 3;
        setPanelLvl(next);
        Animated.spring(panelAnim, { toValue: next, friction: 12, tension: 65, useNativeDriver: false }).start();
    }, [panelLvl]);

    // Select period
    const pickPeriod = useCallback((p) => {
        impactAsync();
        setPeriod(p);
        setPeriodOpen(false);
    }, [setPeriod]);

    // Computed
    const polylines = useMemo(() => mapRoutes.filter(r => r.routeData.length > 1), [mapRoutes]);

    const panelH = panelAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [126, 310, 480] });
    const toggleTX = toggleSlide.interpolate({ inputRange: [0, 1], outputRange: [2, 72] });

    return (
        <View style={st.root}>
            {/* ═══ Map ═══ */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={PUNE}
                userInterfaceStyle="dark"
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                showsBuildings={false}
                showsTraffic={false}
                showsIndoors={false}
                showsPointsOfInterest={false}
                rotateEnabled
                pitchEnabled
                customMapStyle={MAP_STYLE}
            >
                {/* Route lines */}
                {viewMode === 'routes' && polylines.map(r => (
                    <Polyline
                        key={r.id}
                        coordinates={r.routeData}
                        strokeColor={COLORS[r.actionType] || '#c4b5fd'}
                        strokeWidth={3.5}
                        lineCap="round"
                        lineJoin="round"
                        lineDashPattern={r.actionType === 'walking' ? [8, 5] : undefined}
                    />
                ))}
                {/* Start markers */}
                {viewMode === 'routes' && polylines.map(r => (
                    <Marker key={`d${r.id}`} coordinate={r.routeData[0]} anchor={{ x: 0.5, y: 0.5 }}
                        title={r.label} description={`${r.distanceKm}km \u00b7 ${r.co2Saved}kg CO\u2082`}>
                        <View style={[st.dot, { backgroundColor: COLORS[r.actionType] }]} />
                    </Marker>
                ))}
                {/* Heatmap */}
                {viewMode === 'heatmap' && heatmapData && heatmapData.map((pt, i) => (
                    <MapCircle key={`h${i}`}
                        center={{ latitude: pt.latitude, longitude: pt.longitude }}
                        radius={heatR(pt.weight)}
                        fillColor={heatColor(pt.weight)}
                        strokeColor="transparent"
                        strokeWidth={0}
                    />
                ))}
            </MapView>

            {/* ═══ Welcome ═══ */}
            <Animated.View style={[st.welcome, { opacity: welcomeOp }]} pointerEvents="none">
                <BlurView intensity={30} tint="dark" style={st.welcomeInner}>
                    <Leaf size={13} color="#4ade80" />
                    <Text style={st.welcomeTxt}>Your greenest corridor {'\ud83c\udf3f'}</Text>
                </BlurView>
            </Animated.View>

            {/* ═══ Top right: toggle ═══ */}
            <View style={st.toggle}>
                <Animated.View style={[st.togglePill, { transform: [{ translateX: toggleTX }] }]} />
                <TouchableOpacity style={st.toggleBtn} onPress={() => { impactAsync(); setViewMode('routes'); }} activeOpacity={0.7}>
                    <Route size={11} color={viewMode === 'routes' ? '#fff' : '#64748b'} />
                    <Text style={[st.toggleTxt, viewMode === 'routes' && st.toggleOn]}>Routes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.toggleBtn} onPress={() => { impactAsync(); setViewMode('heatmap'); }} activeOpacity={0.7}>
                    <Flame size={11} color={viewMode === 'heatmap' ? '#fff' : '#64748b'} />
                    <Text style={[st.toggleTxt, viewMode === 'heatmap' && st.toggleOn]}>Heat</Text>
                </TouchableOpacity>
            </View>

            {/* ═══ Route count badge ═══ */}
            {viewMode === 'routes' && mapRoutes.length > 0 && (
                <View style={st.countBadge}>
                    <Text style={st.countTxt}>{mapRoutes.length} routes</Text>
                </View>
            )}

            {/* ═══ Bottom Panel ═══ */}
            <Animated.View style={[st.panel, { height: panelH }]}>
                <BlurView intensity={80} tint="dark" style={st.panelBlur}>
                    {/* Handle */}
                    <TouchableOpacity style={st.handle} onPress={cyclePanel} activeOpacity={0.7}>
                        <View style={st.handleBar} />
                    </TouchableOpacity>

                    {/* Period dropdown */}
                    <View style={st.periodRow}>
                        <TouchableOpacity style={st.periodBtn} onPress={() => setPeriodOpen(!periodOpen)} activeOpacity={0.7}>
                            <Text style={st.periodTxt}>{PERIOD_LABELS[period]}</Text>
                            <ChevronDown size={11} color="#64748b" />
                        </TouchableOpacity>
                        {periodOpen && (
                            <View style={st.periodDrop}>
                                {PERIODS.filter(p => p !== period).map(p => (
                                    <TouchableOpacity key={p} style={st.periodItem} onPress={() => pickPeriod(p)}>
                                        <Text style={st.periodItemTxt}>{PERIOD_LABELS[p]}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* ── Collapsed: core stats ── */}
                    <View style={st.statsRow}>
                        <View style={st.statCore}>
                            <Zap size={14} color="#60a5fa" />
                            <Text style={st.statBig}>{mapStats?.totalCo2Saved || '0'}</Text>
                            <Text style={st.statUnit}>kg CO₂</Text>
                        </View>
                        <View style={st.statDiv} />
                        <View style={st.statCore}>
                            <Navigation size={14} color="#f97316" />
                            <Text style={st.statBig}>{mapStats?.totalDistanceKm || '0'}</Text>
                            <Text style={st.statUnit}>km</Text>
                        </View>
                        <View style={st.statDiv} />
                        <View style={st.statCore}>
                            <MapPin size={14} color="#ec4899" />
                            <Text style={st.statBig}>{mapStats?.totalSessions || '0'}</Text>
                            <Text style={st.statUnit}>sessions</Text>
                        </View>
                    </View>

                    {/* ── Half expanded ── */}
                    {panelLvl >= 1 && mapStats && (
                        <View style={st.section}>
                            <View style={st.grid}>
                                <Stat label="Calories" value={`${mapStats.totalCalories}`} />
                                <Stat label="Avg Speed" value={`${mapStats.avgSpeed} km/h`} />
                                <Stat label="Duration" value={`${mapStats.totalHours}h`} />
                                <Stat label="Fuel Saved" value={`${mapStats.fuelSavedL} L`} />
                                <Stat label={"Trees \u2248"} value={`${mapStats.equivalentTrees}`} />
                            </View>
                        </View>
                    )}

                    {/* ── Fully expanded ── */}
                    {panelLvl >= 2 && mapStats && (
                        <View style={st.section}>
                            <View style={st.grid}>
                                <Stat label="Longest Ride" value={`${mapStats.longestRouteKm} km`} />
                                <Stat label="Most Used" value={mapStats.mostUsedRoute} />
                                <Stat label="Avg/Session" value={`${mapStats.avgDistPerSession} km`} />
                                <Stat label="Best Day" value={mapStats.mostActiveDay} />
                            </View>
                            <WeekChart data={mapStats.weeklyTrend} />
                            <View style={st.equivRow}>
                                <Leaf size={13} color="#4ade80" />
                                <Text style={st.equivTxt}>
                                    Equivalent to planting {mapStats.equivalentTrees} trees
                                </Text>
                            </View>
                        </View>
                    )}
                </BlurView>
            </Animated.View>
        </View>
    );
}

// ─── Muted grayscale map ───
const MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#181818' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#252525' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#272727' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f1f1f' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#303030' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1a2d' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#181818' }] },
];

// ─── Styles ───
const TOP = Platform.OS === 'ios' ? 60 : 42;

const st = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0f0f0f' },

    // Welcome
    welcome: { position: 'absolute', top: TOP + 44, left: 28, right: 28, zIndex: 50 },
    welcomeInner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 12, overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(74,222,128,0.12)',
    },
    welcomeTxt: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },

    // Toggle (top right)
    toggle: {
        position: 'absolute', top: TOP, right: 16, zIndex: 30,
        flexDirection: 'row',
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderRadius: 18, padding: 2,
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(71,85,105,0.2)',
    },
    togglePill: {
        position: 'absolute', top: 2, left: 0,
        width: 70, height: 28, borderRadius: 16,
        backgroundColor: 'rgba(96,165,250,0.18)',
    },
    toggleBtn: {
        width: 70, height: 28,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    },
    toggleTxt: { color: '#64748b', fontSize: 10, fontWeight: '600' },
    toggleOn: { color: '#fff' },

    // Count badge
    countBadge: {
        position: 'absolute', top: TOP, left: 16, zIndex: 20,
        backgroundColor: 'rgba(15,23,42,0.75)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 10,
    },
    countTxt: { color: '#64748b', fontSize: 10, fontWeight: '600' },

    // Panel
    panel: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 84 : 60,
        left: 12, right: 12,
        borderRadius: 22, overflow: 'hidden', zIndex: 40,
    },
    panelBlur: {
        flex: 1, paddingHorizontal: 18, paddingTop: 4, paddingBottom: 14,
        borderRadius: 22, overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(71,85,105,0.2)',
    },
    handle: { alignItems: 'center', paddingVertical: 6 },
    handleBar: { width: 32, height: 3, borderRadius: 1.5, backgroundColor: '#334155' },

    // Period
    periodRow: { flexDirection: 'row', marginBottom: 10, position: 'relative' },
    periodBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(30,41,59,0.6)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 8,
    },
    periodTxt: { color: '#94a3b8', fontSize: 10, fontWeight: '600' },
    periodDrop: {
        position: 'absolute', top: 30, left: 0,
        backgroundColor: '#1e293b', borderRadius: 8,
        paddingVertical: 2, minWidth: 90, zIndex: 100,
        borderWidth: StyleSheet.hairlineWidth, borderColor: '#334155',
    },
    periodItem: { paddingHorizontal: 10, paddingVertical: 7 },
    periodItemTxt: { color: '#cbd5e1', fontSize: 10, fontWeight: '500' },

    // Core stats
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        paddingVertical: 2,
    },
    statCore: { alignItems: 'center', gap: 3 },
    statBig: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
    statUnit: { color: '#475569', fontSize: 8.5, fontWeight: '500' },
    statDiv: { width: StyleSheet.hairlineWidth, height: 26, backgroundColor: '#1e293b' },

    // Sections
    section: {
        marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1e293b',
        paddingTop: 14,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around',
        rowGap: 12, columnGap: 8,
    },
    halfItem: { alignItems: 'center', minWidth: 70 },
    halfLabel: { color: '#475569', fontSize: 9, fontWeight: '500', marginBottom: 2 },
    halfValue: { color: '#e2e8f0', fontSize: 12.5, fontWeight: '700' },

    // Equiv
    equivRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, marginTop: 12,
        backgroundColor: 'rgba(74,222,128,0.06)',
        paddingVertical: 8, borderRadius: 10,
    },
    equivTxt: { color: '#6ee7b7', fontSize: 12, fontWeight: '600' },

    // Chart
    chartWrap: { marginTop: 12 },
    chartTitle: { color: '#475569', fontSize: 9, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
    chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 40 },
    chartCol: { alignItems: 'center', gap: 3 },
    chartBar: { width: 20, borderRadius: 4 },
    chartDay: { color: '#475569', fontSize: 7.5, fontWeight: '600' },

    // Map markers
    dot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
});
