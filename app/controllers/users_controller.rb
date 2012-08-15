class UsersController < ApplicationController
  before_filter :signed_in_user,
    #            only: [:index, :edit, :update, :destroy, :following, :followers]
               only: [:index, :edit, :update, :destroy]
  before_filter :correct_user,   only: [:edit, :update]
  before_filter :admin_user,     only: :destroy
  def index
    @users = User.paginate(page: params[:page])
  end

  def show
    @user = User.find(params[:id])
    if(@user.nil?) 
      logger.debug "user object is nill"
    end  
    render :text => @user.inspect
    #  @microposts = @user.microposts.paginate(page: params[:page])
  end

  def new
    @user = User.new
    @user.build_organization
  end

  def create
    @user = User.new(params[:user])

    if @user.save
      sign_in @user
      redirect_to customizations_show_url, notice: "Signed in!"
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    logger.debug "#{params}"
    if @user.update_attributes(params[:user])
      flash[:success] = "Profile updated"
      sign_in @user
      redirect_to @user
    else
      render 'edit'
    end
  end

  def destroy
    User.find(params[:id]).destroy
    flash[:success] = "User destroyed."
    redirect_to users_path
  end

=begin
def following
@title = "Organization"
@user = User.find(params[:id])
@organization = @user.organizationfollowed_users.paginate(page: params[:page])
render 'show_org'
end

def apps
@title = "apps"
@user = User.find(params[:id])
@users = @user.apps.paginate(page: params[:page])
render 'show_apps'
end
=end

  private

  def correct_user
    @user = User.find(params[:id])
    redirect_to(root_path) unless current_user?(@user)
  end

  def admin_user
    redirect_to(root_path) unless current_user.admin?
  end
end