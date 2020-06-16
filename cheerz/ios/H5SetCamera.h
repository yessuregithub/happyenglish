//
//  H5SetCamera.h
//  swkd1
//
//  Created by user on 2020/6/16.
//
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

@interface H5SetCamera : NSObject
{
    
}
@property (assign) AVCaptureSession* captureSession;

@property (assign) AVCaptureDeviceInput* captureDeviceInput;

@property (assign) AVCaptureVideoDataOutput* captureVideoDataOutput;

@property (assign) AVCaptureConnection* captureConnection;

-(void)setLanscapeCamera;
@end
