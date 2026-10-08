import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Svg, { Path } from 'react-native-svg';

function invertEdge(edge) {
    if (edge === 'out') return 'in';
    if (edge === 'in') return 'out';

    return 'flat';
}

function getPuzzleEdges(index, total, columns) {
    const row = Math.floor(index / columns);
    const column = index % columns;

    const hasLeft = column > 0;

    const hasRight =
        column < columns - 1 &&
        index + 1 < total &&
        Math.floor((index + 1) / columns) === row;

    const hasTop = index - columns >= 0;

    const hasBottom =
        index + columns < total;

    function horizontalEdge(r, c) {
        return (r + c) % 2 === 0
            ? 'out'
            : 'in';
    }

    function verticalEdge(r, c) {
        return (r + c) % 2 === 0
            ? 'in'
            : 'out';
    }

    const right = hasRight
        ? horizontalEdge(row, column)
        : 'flat';

    const left = hasLeft
        ? invertEdge(
              horizontalEdge(row, column - 1)
          )
        : 'flat';

    const bottom = hasBottom
        ? verticalEdge(row, column)
        : 'flat';

    const top = hasTop
        ? invertEdge(
              verticalEdge(row - 1, column)
          )
        : 'flat';

    return {
        top,
        right,
        bottom,
        left,
    };
}

function createPuzzlePath(
    width,
    height,
    edges
) {
    const inset = Math.max(
        8,
        width * 0.09
    );

    const tabDepth = inset;
    const neck = Math.max(
        8,
        width * 0.1
    );

    const left = inset;
    const right = width - inset;

    const top = inset;
    const bottom = height - inset;

    const middleX =
        (left + right) / 2;

    const middleY =
        (top + bottom) / 2;

    let path = `M ${left} ${top}`;

    // TOPO
    if (edges.top === 'flat') {
        path += ` L ${right} ${top}`;
    } else {
        const direction =
            edges.top === 'out'
                ? -1
                : 1;

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
        const direction =
            edges.right === 'out'
                ? 1
                : -1;

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
        const direction =
            edges.bottom === 'out'
                ? 1
                : -1;

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
        const direction =
            edges.left === 'out'
                ? -1
                : 1;

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
    columns,
    overlap,
    onPress,
}) {
    const height = width * 1.02;

    const edges = getPuzzleEdges(
        index,
        total,
        columns
    );

    const path = createPuzzlePath(
        width,
        height,
        edges
    );

    const column =
        index % columns;

    const hasRight =
        column < columns - 1 &&
        index + 1 < total;

    const hasBottom =
        index + columns < total;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                {
                    width,
                    height,

                    marginRight:
                        hasRight
                            ? -overlap
                            : 0,

                    marginBottom:
                        hasBottom
                            ? -overlap
                            : 0,

                    opacity:
                        pressed
                            ? 0.82
                            : 1,
                },
            ]}
        >
            <Svg
                width={width}
                height={height}
                style={StyleSheet.absoluteFill}
            >
                <Path
                    d={path}
                    fill={
                        indicator.backgroundColor ||
                        '#F3F3F3'
                    }
                    stroke="#FFFFFF"
                    strokeWidth={2}
                />
            </Svg>

            <View style={styles.content}>
               

                <MaterialCommunityIcons
                    name={
                        indicator.iconName ||
                        'circle-outline'
                    }
                    size={28}
                    color={
                        indicator.iconColor ||
                        '#777777'
                    }
                />

                <Text
                    style={styles.title}
                    numberOfLines={2}
                >
                    {indicator.title}
                </Text>

                <Text
                    style={styles.value}
                    numberOfLines={1}
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

        paddingHorizontal: 15,
        paddingVertical: 15,

        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        marginTop: 7,

        fontSize: 12,
        lineHeight: 15,

        fontWeight: '700',
        textAlign: 'center',

        color: '#292929',
    },

    value: {
        marginTop: 4,

        fontSize: 10,

        textAlign: 'center',

        color: '#707070',
    },
});