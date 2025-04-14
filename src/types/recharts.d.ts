// Type definitions for recharts
declare module "recharts" {
    import * as React from "react"
  
    export interface LineProps {
      type?:
        | "basis"
        | "basisClosed"
        | "basisOpen"
        | "linear"
        | "linearClosed"
        | "natural"
        | "monotoneX"
        | "monotoneY"
        | "monotone"
        | "step"
        | "stepBefore"
        | "stepAfter"
      dataKey: string
      stroke?: string
      strokeWidth?: number
      dot?: boolean | object | React.ReactNode | ((props: any) => React.ReactNode)
      activeDot?: boolean | object | React.ReactNode | ((props: any) => React.ReactNode)
      name?: string
      isAnimationActive?: boolean
      animationBegin?: number
      animationDuration?: number
      animationEasing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear"
    }
  
    export interface XAxisProps {
      dataKey?: string
      xAxisId?: string | number
      width?: number
      height?: number
      orientation?: "top" | "bottom"
      type?: "number" | "category"
      allowDecimals?: boolean
      allowDataOverflow?: boolean
      tickCount?: number
      domain?: [number | string, number | string] | "auto" | "dataMin" | "dataMax"
      interval?: number | "preserveStart" | "preserveEnd" | "preserveStartEnd"
      padding?: { left?: number; right?: number }
      minTickGap?: number
      axisLine?: boolean | object
      tickLine?: boolean | object
      tickSize?: number
      tick?: boolean | object | React.ReactNode | ((props: any) => React.ReactNode)
      mirror?: boolean
      reversed?: boolean
      label?: string | number | React.ReactNode | object
      scale?:
        | "auto"
        | "linear"
        | "pow"
        | "sqrt"
        | "log"
        | "identity"
        | "time"
        | "band"
        | "point"
        | "ordinal"
        | "quantile"
        | "quantize"
        | "utc"
        | "sequential"
        | "threshold"
      unit?: string | number
      name?: string | number
      tickFormatter?: (value: any) => string
      tickMargin?: number
    }
  
    export interface YAxisProps extends XAxisProps {
      orientation?: "left" | "right"
    }
  
    export interface TooltipProps {
      content?: React.ReactNode | ((props: any) => React.ReactNode)
      viewBox?: { x?: number; y?: number; width?: number; height?: number }
      active?: boolean
      separator?: string
      formatter?: (value: any, name?: string, props?: any) => React.ReactNode
      labelFormatter?: (label: any) => React.ReactNode
      itemSorter?: (item: any) => number
      isAnimationActive?: boolean
      animationBegin?: number
      animationDuration?: number
      animationEasing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear"
      contentStyle?: object
      labelStyle?: object
      wrapperStyle?: object
      cursor?: boolean | object | React.ReactNode
      coordinate?: { x: number; y: number }
      position?: { x: number; y: number }
      trigger?: "hover" | "click"
      offset?: number
      filterNull?: boolean
      allowEscapeViewBox?: { x?: boolean; y?: boolean }
    }
  
    export interface ResponsiveContainerProps {
      aspect?: number
      width?: string | number
      height?: string | number
      minWidth?: string | number
      minHeight?: string | number
      maxHeight?: string | number
      debounce?: number
      id?: string
      className?: string
      children?: React.ReactNode // Added children prop
    }
  
    export interface LineChartProps {
      layout?: "horizontal" | "vertical"
      syncId?: string
      width?: number
      height?: number
      data?: Array<any>
      margin?: { top?: number; right?: number; bottom?: number; left?: number }
      className?: string
      style?: object
      children?: React.ReactNode
    }
  
    export class Line extends React.Component<LineProps> {}
    export class XAxis extends React.Component<XAxisProps> {}
    export class YAxis extends React.Component<YAxisProps> {}
    export class Tooltip extends React.Component<TooltipProps> {}
    export class ResponsiveContainer extends React.Component<ResponsiveContainerProps> {}
    export class LineChart extends React.Component<LineChartProps> {}
  }
  
  