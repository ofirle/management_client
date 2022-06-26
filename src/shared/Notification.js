import { notification } from 'antd';

export const createNotification = (
  type: notificationType,
  message: string,
  description: string = ''
) => {
  notification[type]({
    message,
    description
  });
};

export const notificationType = {
  Success: 'success',
  Info: 'info',
  Warning: 'warning',
  Error: 'error'
};
