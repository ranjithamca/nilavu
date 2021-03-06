##
## Copyright [2013-2016] [Megam Systems]
##
## Licensed under the Apache License, Version 2.0 (the "License");
## you may not use this file except in compliance with the License.
## You may obtain a copy of the License at
##
## http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
##
module Api
  class Accounts < APIDispatch

    def where(params)
      result = api_request(ACCOUNT,SHOW, params)
      result[:body] if result && result.is_a?(Hash)
    end

    def save(params)
      api_request(ACCOUNT, CREATE, params)
    end

    def update(params)
      api_request(ACCOUNT, UPDATE, params)
    end
    
    def reset(params)
      api_request(ACCOUNT, RESET, params, true)
    end
    
     def repassword(params)
      api_request(ACCOUNT, REPASSWORD, params, true)
    end
    
  end
end
