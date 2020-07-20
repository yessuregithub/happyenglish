
#import "H5SetCamera.h"


@implementation H5SetCamera
-(void)setLanscapeCamera {
    
 //    NSArray *cameras= [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
	// // 获取前置摄像头
	// NSArray *captureDeviceArray = [cameras filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"position == %d", AVCaptureDevicePositionFront]];
	// if (!captureDeviceArray.count)
	// {
	// 	NSLog(@"获取前置摄像头失败");
	// 	return;
	// }
	
	UIAlertView * alert = [[UIAlertView alloc] initWithTitle:@"提示" message:@"H5SetCamera 成功" delegate:self cancelButtonTitle:@"取消" otherButtonTitles:@"确定", nil];
	[alert show];
	    
	
	// // 转化为输入设备
	// AVCaptureDevice *camera = captureDeviceArray.firstObject;
	// NSError *errorMessage = nil;
	// self.captureDeviceInput = [AVCaptureDeviceInput deviceInputWithDevice:camera error:&errorMessage];
	// if (errorMessage)
	// {
	// 	NSLog(@"AVCaptureDevice转AVCaptureDeviceInput失败");
	// 	return;
	// }
		
	// // 设置视频输出
	// self.captureVideoDataOutput = [[AVCaptureVideoDataOutput alloc] init];
	// self.captureSession = [[AVCaptureSession alloc] init];
	
	// // 设置前置摄像头
	// [self.captureSession stopRunning];
	
	// // 不使用应用的实例，避免被异常挂断
	// self.captureSession.usesApplicationAudioSession = NO;
	// self.captureVideoDataOutput = [[self.captureSession outputs]firstObject];
	// self.captureConnection = [self.captureVideoDataOutput connectionWithMediaType:AVMediaTypeVideo];
	// self.captureConnection.videoOrientation = AVCaptureVideoOrientationLandscapeLeft;
	// [self.captureSession startRunning];
}
@end
