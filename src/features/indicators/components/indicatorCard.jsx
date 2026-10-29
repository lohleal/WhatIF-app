
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const COLUMNS = 4;

function invertEdge(edge) {
    if (edge === 'out') return 'in';
    if (edge === 'in') return 'out';
    return 'flat';
}

function getPuzzleEdges(index, total) {
    const row = Math.floor(index / COLUMNS);
    const column = index % COLUMNS;

    const hasLeft = column > 0;
    const hasRight = column < COLUMNS - 1 && index + 1 < total;
    const hasTop = index >= COLUMNS;
    const hasBottom = index + COLUMNS < total;

    // Mantém o padrão lateral igual em todas as linhas:
    // 1ª coluna: saliência à direita
    // 2ª coluna: entradas nas laterais
    // 3ª coluna: saliências nas duas laterais
    // 4ª coluna: entrada à esquerda
    const rightPattern = ['out', 'in', 'out', 'flat'];
    const leftPattern = ['flat', 'in', 'out', 'in'];

    const right = hasRight ? rightPattern[column] : 'flat';
    const left = hasLeft ? leftPattern[column] : 'flat';

    // Alterna as peças superiores e inferiores,
    // garantindo encaixes complementares entre as linhas.
    function verticalEdge(r, c) {
        return (r + c) % 2 === 0 ? 'in' : 'out';
    }

    const bottom = hasBottom
        ? verticalEdge(row, column)
        : 'flat';

    const top = hasTop
        ? invertEdge(verticalEdge(row - 1, column))
        : 'flat';

    return { top, right, bottom, left };
}

function createPuzzlePath(width, height, edges) {
    const inset = Math.min(width * 0.09, height * 0.09);
    const tabDepth = inset;
    const neck = Math.min(width * 0.12, height * 0.12);

    const left = inset;
    const right = width - inset;
    const top = inset;
    const bottom = height - inset;

    const middleX = (left + right) / 2;
    const middleY = (top + bottom) / 2;

    let path = `M ${left} ${top}`;

    // TOPO
    if (edges.top === 'flat') {
        path += ` L ${right} ${top}`;
    } else {
        const direction = edges.top === 'out' ? -1 : 1;

        path += `
            L ${middleX - neck} ${top}
            C ${middleX - neck} ${top}
              ${middleX - neck} ${top + direction * tabDepth}
              ${middleX} ${top + direction * tabDepth}
            C ${middleX + neck} ${top + direction * tabDepth}
              ${middleX + neck} ${top}
              ${middleX + neck} ${top}
            L ${right} ${top}
        `;
    }

    // DIREITA
    if (edges.right === 'flat') {
        path += ` L ${right} ${bottom}`;
    } else {
        const direction = edges.right === 'out' ? 1 : -1;

        path += `
            L ${right} ${middleY - neck}
            C ${right} ${middleY - neck}
              ${right + direction * tabDepth} ${middleY - neck}
              ${right + direction * tabDepth} ${middleY}
            C ${right + direction * tabDepth} ${middleY + neck}
              ${right} ${middleY + neck}
              ${right} ${middleY + neck}
            L ${right} ${bottom}
        `;
    }

    // BASE
    if (edges.bottom === 'flat') {
        path += ` L ${left} ${bottom}`;
    } else {
        const direction = edges.bottom === 'out' ? 1 : -1;

        path += `
            L ${middleX + neck} ${bottom}
            C ${middleX + neck} ${bottom}
              ${middleX + neck} ${bottom + direction * tabDepth}
              ${middleX} ${bottom + direction * tabDepth}
            C ${middleX - neck} ${bottom + direction * tabDepth}
              ${middleX - neck} ${bottom}
              ${middleX - neck} ${bottom}
            L ${left} ${bottom}
        `;
    }

    // ESQUERDA
    if (edges.left === 'flat') {
        path += ` L ${left} ${top}`;
    } else {
        const direction = edges.left === 'out' ? -1 : 1;

        path += `
            L ${left} ${middleY + neck}
            C ${left} ${middleY + neck}
              ${left + direction * tabDepth} ${middleY + neck}
              ${left + direction * tabDepth} ${middleY}
            C ${left + direction * tabDepth} ${middleY - neck}
              ${left} ${middleY - neck}
              ${left} ${middleY - neck}
            L ${left} ${top}
        `;
    }

    path += ' Z';
    return path;
}

export default function IndicatorCard({
    indicator,
    width,
    index,
    total,
    overlap = 8,
    overlapVertical = 10,
    onPress,
}) {
    const height = width * 1.02;

    const edges = getPuzzleEdges(index, total);
    const path = createPuzzlePath(width, height, edges);

    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);

    const hasRight = column < COLUMNS - 1 && index + 1 < total;
    const hasBottom = index + COLUMNS < total;

    // Ajusta ícones e textos proporcionalmente à peça.
    const scale = width / 100;
    const iconSize = Math.max(16, Math.min(28, 28 * scale));
    const titleSize = Math.max(9, Math.min(12, 12 * scale));
    const valueSize = Math.max(8, Math.min(10, 10 * scale));
    //const overlapVertical = Math.min(10, width * 0.045);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                {
                    width,
                    height,
                    marginRight: hasRight ? -overlap : 0,
                    marginBottom: hasBottom ? -overlapVertical : 0,
                    opacity: pressed ? 0.82 : 1,
                    zIndex: row * 4 + column,
                },
            ]}
        >
            <Svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={StyleSheet.absoluteFill}
            >
                <Path
                    d={path}
                    fill={indicator.backgroundColor || '#F3F3F3'}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                />
            </Svg>

            <View
                style={[
                    styles.content,
                    {
                        paddingHorizontal: Math.max(3, width * 0.04),
                        paddingVertical: Math.max(5, height * 0.1),
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={indicator.iconName || 'circle-outline'}
                    size={iconSize}
                    color={indicator.iconColor || '#777777'}
                />

                <Text
                    style={[styles.title, { fontSize: titleSize }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                >
                    {indicator.title}
                </Text>

                <Text
                    style={[styles.value, { fontSize: valueSize }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                >
                    {indicator.value}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        marginTop: 5,
        lineHeight: 15,
        fontWeight: '700',
        textAlign: 'center',
        color: '#292929',
    },

    value: {
        marginTop: 3,
        textAlign: 'center',
        color: '#707070',
    },
});
