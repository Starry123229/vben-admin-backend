interface PinInputProps {
  class?: any;
  /**
   * 验证码长度
   */
  codeLength?: number;
  /**
   * 发送验证码按钮文本
   */
  createText?: (countdown: number) => string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 自定义验证码发送逻辑。
   * 仅在显式传入时才渲染内嵌「发送验证码」按钮；不传则不渲染，
   * 避免出现"点击只倒计时不发送"的死按钮（发送逻辑由外部自行实现）。
   */
  handleSendCode?: () => Promise<void>;
  /**
   * 发送验证码按钮loading
   */
  loading?: boolean;
  /**
   * 最大重试时间
   */
  maxTime?: number;
}

export type { PinInputProps };
